import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { enforceAdminCsrf } from "@/lib/security/csrf"

function createRequest(url: string, method: string, headers?: Record<string, string>) {
  return new NextRequest(url, {
    method,
    headers,
  })
}

describe("enforceAdminCsrf", () => {
  it("permite métodos no mutantes sin encabezados csrf", () => {
    const request = createRequest("http://localhost:3000/admin/propiedades", "GET")

    const decision = enforceAdminCsrf(request)

    expect(decision).toEqual({ ok: true })
  })

  it("devuelve 403 en mutaciones sin origin/referer válidos", async () => {
    const request = createRequest("http://localhost:3000/admin/propiedades", "POST")

    const decision = enforceAdminCsrf(request)

    expect(decision.ok).toBe(false)
    if (decision.ok) {
      return
    }

    expect(decision.response.status).toBe(403)
    const body = await decision.response.json()
    expect(body).toEqual(
      expect.objectContaining({
        error: "forbidden",
        message: "forbidden",
      })
    )
    expect(typeof body.requestId).toBe("string")
  })

  it("permite mutaciones con origin same-origin", () => {
    const request = createRequest("http://localhost:3000/admin/propiedades", "POST", {
      origin: "http://localhost:3000",
    })

    const decision = enforceAdminCsrf(request)

    expect(decision).toEqual({ ok: true })
  })

  it("permite mutaciones con referer same-origin cuando origin no existe", () => {
    const request = createRequest("http://localhost:3000/admin/propiedades", "PATCH", {
      referer: "http://localhost:3000/admin/dashboard",
    })

    const decision = enforceAdminCsrf(request)

    expect(decision).toEqual({ ok: true })
  })
})
