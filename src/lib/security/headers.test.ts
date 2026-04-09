import { describe, expect, it } from "vitest"
import { getSecurityHeaders, SECURITY_HEADERS, withSecurityHeaders } from "@/lib/security/headers"

describe("withSecurityHeaders", () => {
  it("aplica todos los headers de seguridad esperados", () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    })

    const secured = withSecurityHeaders(response)

    expect(secured).toBe(response)

    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      expect(secured.headers.get(key)).toBe(value)
    }
  })

  it("incluye CSP en todas las respuestas", () => {
    const headers = getSecurityHeaders({ isProduction: false, requestProtocol: "http" })

    expect(headers["Content-Security-Policy"]).toContain("default-src 'self'")
    expect(headers["Content-Security-Policy"]).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'")
  })

  it("incluye HSTS solo en producción https", () => {
    const prodHttps = getSecurityHeaders({ isProduction: true, requestProtocol: "https" })
    const prodHttp = getSecurityHeaders({ isProduction: true, requestProtocol: "http" })
    const devHttps = getSecurityHeaders({ isProduction: false, requestProtocol: "https" })

    expect(prodHttps["Strict-Transport-Security"]).toBe("max-age=31536000; includeSubDomains")
    expect(prodHttp["Strict-Transport-Security"]).toBeUndefined()
    expect(devHttps["Strict-Transport-Security"]).toBeUndefined()
  })

  it("resuelve protocolo x-forwarded-proto para HSTS", () => {
    const response = new Response(JSON.stringify({ ok: true }), { status: 200 })
    const request = new Request("https://example.com/admin", {
      headers: {
        "x-forwarded-proto": "https",
      },
    })

    const secured = withSecurityHeaders(response, {
      isProduction: true,
      request,
    })

    expect(secured.headers.get("Strict-Transport-Security")).toBe("max-age=31536000; includeSubDomains")
  })
})
