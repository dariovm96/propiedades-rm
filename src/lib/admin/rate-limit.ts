type BucketState = {
  count: number
  resetAtMs: number
}

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

const bucketStore = new Map<string, BucketState>()

function getNowMs(nowMs?: number): number {
  return typeof nowMs === "number" ? nowMs : Date.now()
}

function clampSeconds(valueMs: number): number {
  if (valueMs <= 0) return 0
  return Math.ceil(valueMs / 1000)
}

export function buildRateLimitBucketKey(baseKey: string, config: RateLimitConfig): string {
  return `${config.keyPrefix}:${baseKey}`
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
  nowMs?: number
): RateLimitDecision {
  const currentMs = getNowMs(nowMs)
  const existing = bucketStore.get(key)

  if (!existing || existing.resetAtMs <= currentMs) {
    const resetAtMs = currentMs + config.windowMs
    bucketStore.set(key, { count: 1, resetAtMs })

    return {
      allowed: true,
      remaining: Math.max(config.max - 1, 0),
      retryAfterSec: 0,
    }
  }

  if (existing.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: clampSeconds(existing.resetAtMs - currentMs),
    }
  }

  existing.count += 1
  bucketStore.set(key, existing)

  return {
    allowed: true,
    remaining: Math.max(config.max - existing.count, 0),
    retryAfterSec: 0,
  }
}

export function resetRateLimitStore() {
  bucketStore.clear()
}
