import { describe, expect, it } from "vitest"

import { sanitizeError } from "@/lib/security/error-sanitizer"

describe("sanitizeError", () => {
  it("sanitiza 500 y no expone causa interna", () => {
    const result = sanitizeError({
      status: 500,
      error: "select * from users where password = 'x'",
      requestId: "req-500",
    })

    expect(result.envelope).toEqual({
      error: "internal_error",
      message: "internal server error",
      requestId: "req-500",
    })
    expect(result.internalCause).toBe("select * from users where password = 'x'")
  })

  it("mantiene mensaje seguro en 4xx y agrega requestId", () => {
    const result = sanitizeError({
      status: 400,
      error: "invalid payload format",
      requestId: "req-400",
    })

    expect(result.envelope).toEqual({
      error: "bad_request",
      message: "invalid payload format",
      requestId: "req-400",
    })
    expect(result.internalCause).toBeUndefined()
  })

  it("reemplaza mensaje sensible en 4xx por fallback seguro", () => {
    const result = sanitizeError({
      status: 400,
      error: "supabase sql error: select * from tokens",
      requestId: "req-400-sensitive",
    })

    expect(result.envelope).toEqual({
      error: "bad_request",
      message: "invalid request",
      requestId: "req-400-sensitive",
    })
    expect(result.internalCause).toBe("supabase sql error: select * from tokens")
  })
})
