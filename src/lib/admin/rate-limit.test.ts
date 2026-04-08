import { beforeEach, describe, expect, it } from "vitest"

import { checkRateLimit, resetRateLimitStore } from "@/lib/admin/rate-limit"

const CONFIG = {
  keyPrefix: "admin",
  windowMs: 60_000,
  max: 2,
} as const

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitStore()
  })

  it("permite requests hasta el umbral y luego bloquea con retryAfterSec", () => {
    const key = "admin:route:127.0.0.1:test@example.com"

    const first = checkRateLimit(key, CONFIG, 1_000)
    const second = checkRateLimit(key, CONFIG, 1_500)
    const blocked = checkRateLimit(key, CONFIG, 2_000)

    expect(first).toEqual({ allowed: true, remaining: 1, retryAfterSec: 0 })
    expect(second).toEqual({ allowed: true, remaining: 0, retryAfterSec: 0 })
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })

  it("resetea ventana y vuelve a permitir después del windowMs", () => {
    const key = "admin:route:127.0.0.1:test@example.com"

    checkRateLimit(key, CONFIG, 10_000)
    checkRateLimit(key, CONFIG, 10_001)

    const blocked = checkRateLimit(key, CONFIG, 10_002)
    expect(blocked.allowed).toBe(false)

    const afterWindow = checkRateLimit(key, CONFIG, 70_001)
    expect(afterWindow).toEqual({ allowed: true, remaining: 1, retryAfterSec: 0 })
  })
})
