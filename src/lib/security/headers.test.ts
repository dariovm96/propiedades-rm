import { describe, expect, it } from "vitest"
import { SECURITY_HEADERS, withSecurityHeaders } from "@/lib/security/headers"

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
})
