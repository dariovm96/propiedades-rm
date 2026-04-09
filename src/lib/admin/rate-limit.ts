export type RateLimitConfig = {
  windowMs: number
  max: number
  keyPrefix: string
}

export type RateLimitDecision = {
  allowed: boolean
  remaining: number
  retryAfterSec: number
}

export type DistributedRateLimiterInput = {
  key: string
  windowMs: number
  limit: number
  nowMs?: number
}

export type DistributedRateLimiter = {
  consume(input: DistributedRateLimiterInput): Promise<RateLimitDecision>
  reset?(): void
}

type BucketState = {
  count: number
  resetAtMs: number
}

const bucketStore = new Map<string, BucketState>()

function getNowMs(nowMs?: number): number {
  return typeof nowMs === "number" ? nowMs : Date.now()
}

function clampSeconds(valueMs: number): number {
  if (valueMs <= 0) return 0
  return Math.ceil(valueMs / 1000)
}

const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
const upstashRestToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

function shouldAllowMemoryFallbackInProduction(): boolean {
  return process.env.ADMIN_RATE_LIMIT_MEMORY_FALLBACK === "true"
}

function createInMemoryRateLimiter(): DistributedRateLimiter {
  return {
    async consume(input: DistributedRateLimiterInput): Promise<RateLimitDecision> {
      const currentMs = getNowMs(input.nowMs)
      const existing = bucketStore.get(input.key)

      if (!existing || existing.resetAtMs <= currentMs) {
        const resetAtMs = currentMs + input.windowMs
        bucketStore.set(input.key, { count: 1, resetAtMs })

        return {
          allowed: true,
          remaining: Math.max(input.limit - 1, 0),
          retryAfterSec: 0,
        }
      }

      if (existing.count >= input.limit) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSec: clampSeconds(existing.resetAtMs - currentMs),
        }
      }

      existing.count += 1
      bucketStore.set(input.key, existing)

      return {
        allowed: true,
        remaining: Math.max(input.limit - existing.count, 0),
        retryAfterSec: 0,
      }
    },
    reset() {
      bucketStore.clear()
    },
  }
}

type UpstashEvalResponse = {
  result?: [number | string, number | string]
  error?: string
}

export function createUpstashRateLimiter(options?: {
  url?: string
  token?: string
  fetchImpl?: typeof fetch
}): DistributedRateLimiter {
  const url = options?.url ?? upstashRestUrl
  const token = options?.token ?? upstashRestToken
  const fetchImpl = options?.fetchImpl ?? fetch

  if (!url || !token) {
    throw new Error("distributed rate limiter is not configured")
  }

  const evalScript = [
    "local current = redis.call('INCR', KEYS[1])",
    "if current == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end",
    "local ttl = redis.call('PTTL', KEYS[1])",
    "return {current, ttl}",
  ].join("\n")

  return {
    async consume(input: DistributedRateLimiterInput): Promise<RateLimitDecision> {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: ["EVAL", evalScript, "1", input.key, String(input.windowMs)],
        }),
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`distributed rate limiter request failed: ${response.status}`)
      }

      const payload = (await response.json()) as UpstashEvalResponse
      if (payload.error || !payload.result || payload.result.length < 2) {
        throw new Error(payload.error || "distributed rate limiter invalid response")
      }

      const currentRaw = Number(payload.result[0])
      const ttlRaw = Number(payload.result[1])
      const current = Number.isFinite(currentRaw) ? currentRaw : input.limit + 1
      const ttlMs = Number.isFinite(ttlRaw) ? Math.max(ttlRaw, 0) : input.windowMs

      if (current > input.limit) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSec: clampSeconds(ttlMs),
        }
      }

      return {
        allowed: true,
        remaining: Math.max(input.limit - current, 0),
        retryAfterSec: 0,
      }
    },
  }
}

function createRateLimiterFromEnvironment(): DistributedRateLimiter {
  if (upstashRestUrl && upstashRestToken) {
    return createUpstashRateLimiter()
  }

  if (process.env.NODE_ENV !== "production") {
    return createInMemoryRateLimiter()
  }

  if (shouldAllowMemoryFallbackInProduction()) {
    console.warn("admin_rate_limit_memory_fallback_enabled", {
      reason: "distributed backend missing in production",
    })
    return createInMemoryRateLimiter()
  }

  throw new Error("distributed rate limiter backend is required in production")
}

const memoryFallbackRateLimiter = createInMemoryRateLimiter()
let activeRateLimiter: DistributedRateLimiter = createRateLimiterFromEnvironment()

export function buildRateLimitBucketKey(baseKey: string, config: RateLimitConfig): string {
  return `${config.keyPrefix}:${baseKey}`
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
  nowMs?: number
): Promise<RateLimitDecision> {
  const input = {
    key,
    windowMs: config.windowMs,
    limit: config.max,
    nowMs,
  }

  try {
    return await activeRateLimiter.consume(input)
  } catch (error) {
    if (!shouldAllowMemoryFallbackInProduction()) {
      throw error
    }

    console.warn("admin_rate_limit_memory_fallback_runtime", {
      reason: error instanceof Error ? error.message : "unknown",
    })

    return memoryFallbackRateLimiter.consume(input)
  }
}

export function resetRateLimitStore() {
  activeRateLimiter.reset?.()
}

export function setRateLimiterForTests(rateLimiter: DistributedRateLimiter) {
  activeRateLimiter = rateLimiter
}

export function restoreRateLimiterFromEnvironment() {
  activeRateLimiter = createRateLimiterFromEnvironment()
}
