import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  checkRateLimit,
  createUpstashRateLimiter,
  restoreRateLimiterFromEnvironment,
  setRateLimiterForTests,
  type DistributedRateLimiter,
} from "@/lib/admin/rate-limit"

const CONFIG = {
  keyPrefix: "admin",
  windowMs: 60_000,
  max: 2,
} as const

describe("checkRateLimit", () => {
  const memoryState = new Map<string, { count: number; resetAtMs: number }>()

  const inMemoryDistributedLimiter: DistributedRateLimiter = {
    async consume({ key, windowMs, limit, nowMs }) {
      const currentMs = typeof nowMs === "number" ? nowMs : Date.now()
      const existing = memoryState.get(key)

      if (!existing || existing.resetAtMs <= currentMs) {
        const resetAtMs = currentMs + windowMs
        memoryState.set(key, { count: 1, resetAtMs })
        return {
          allowed: true,
          remaining: Math.max(limit - 1, 0),
          retryAfterSec: 0,
        }
      }

      if (existing.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSec: Math.ceil((existing.resetAtMs - currentMs) / 1000),
        }
      }

      existing.count += 1
      memoryState.set(key, existing)

      return {
        allowed: true,
        remaining: Math.max(limit - existing.count, 0),
        retryAfterSec: 0,
      }
    },
    reset() {
      memoryState.clear()
    },
  }

  beforeEach(() => {
    memoryState.clear()
    setRateLimiterForTests(inMemoryDistributedLimiter)
  })

  afterEach(() => {
    restoreRateLimiterFromEnvironment()
  })

  it("permite requests hasta el umbral y luego bloquea con retryAfterSec", async () => {
    const key = "admin:route:127.0.0.1:test@example.com"

    const first = await checkRateLimit(key, CONFIG, 1_000)
    const second = await checkRateLimit(key, CONFIG, 1_500)
    const blocked = await checkRateLimit(key, CONFIG, 2_000)

    expect(first).toEqual({ allowed: true, remaining: 1, retryAfterSec: 0 })
    expect(second).toEqual({ allowed: true, remaining: 0, retryAfterSec: 0 })
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })

  it("resetea ventana y vuelve a permitir después del windowMs", async () => {
    const key = "admin:route:127.0.0.1:test@example.com"

    await checkRateLimit(key, CONFIG, 10_000)
    await checkRateLimit(key, CONFIG, 10_001)

    const blocked = await checkRateLimit(key, CONFIG, 10_002)
    expect(blocked.allowed).toBe(false)

    const afterWindow = await checkRateLimit(key, CONFIG, 70_001)
    expect(afterWindow).toEqual({ allowed: true, remaining: 1, retryAfterSec: 0 })
  })

  it("mantiene enforcement consistente entre dos instancias del limiter distribuido", async () => {
    const counters = new Map<string, { count: number; resetAtMs: number }>()
    const nowMs = 5_000

    const fetchMock: typeof fetch = async (_url, init) => {
      const parsed = JSON.parse(String(init?.body ?? "{}")) as {
        command?: string[]
      }
      const key = parsed.command?.[3] ?? ""
      const windowMs = Number(parsed.command?.[4] ?? "0")

      const state = counters.get(key)
      if (!state || state.resetAtMs <= nowMs) {
        counters.set(key, { count: 1, resetAtMs: nowMs + windowMs })
      } else {
        state.count += 1
        counters.set(key, state)
      }

      const current = counters.get(key)!
      const ttl = Math.max(current.resetAtMs - nowMs, 0)

      return {
        ok: true,
        json: async () => ({ result: [current.count, ttl] }),
      } as Response
    }

    const instanceA = createUpstashRateLimiter({
      url: "https://example.upstash.io",
      token: "token",
      fetchImpl: fetchMock,
    })
    const instanceB = createUpstashRateLimiter({
      url: "https://example.upstash.io",
      token: "token",
      fetchImpl: fetchMock,
    })

    const key = "admin:admin_propiedades_update_delete:127.0.0.1:admin@example.com"
    const first = await instanceA.consume({ key, windowMs: 60_000, limit: 2 })
    const second = await instanceB.consume({ key, windowMs: 60_000, limit: 2 })
    const blocked = await instanceA.consume({ key, windowMs: 60_000, limit: 2 })

    expect(first).toEqual({ allowed: true, remaining: 1, retryAfterSec: 0 })
    expect(second).toEqual({ allowed: true, remaining: 0, retryAfterSec: 0 })
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })
})
