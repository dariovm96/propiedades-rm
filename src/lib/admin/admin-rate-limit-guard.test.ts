import { describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

import { withAdminRateLimit } from "@/lib/admin/admin-rate-limit-guard"
import { resetRateLimitStore } from "@/lib/admin/rate-limit"

function createRequest(method: string, ip = "127.0.0.1") {
  return new NextRequest("http://localhost:3000/admin/propiedades", {
    method,
    headers: {
      "x-forwarded-for": ip,
    },
  })
}

describe("withAdminRateLimit", () => {
  it("devuelve null dentro del umbral", () => {
    resetRateLimitStore()
    const response = withAdminRateLimit(createRequest("POST"), {
      routeKey: "admin_propiedades_create",
      adminEmail: "admin@example.com",
    })

    expect(response).toBeNull()
  })

  it("al superar umbral devuelve 429 con Retry-After y log admin_rate_limit_blocked", () => {
    resetRateLimitStore()
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    for (let index = 0; index < 20; index += 1) {
      const allowed = withAdminRateLimit(createRequest("POST"), {
        routeKey: "admin_propiedades_create",
        adminEmail: "admin@example.com",
      })
      expect(allowed).toBeNull()
    }

    const blocked = withAdminRateLimit(createRequest("POST"), {
      routeKey: "admin_propiedades_create",
      adminEmail: "admin@example.com",
    })

    expect(blocked).not.toBeNull()
    expect(blocked?.status).toBe(429)
    expect(blocked?.headers.get("Retry-After")).toBeTruthy()
    expect(warnSpy).toHaveBeenCalledWith(
      "admin_rate_limit_blocked",
      expect.objectContaining({
        route: "admin_propiedades_create",
        method: "POST",
      })
    )
  })
})
