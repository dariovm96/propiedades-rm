import { describe, expect, it } from "vitest"
import { jsonError, jsonSuccess } from "@/lib/api-response"

describe("api response security headers", () => {
  it("jsonSuccess incluye headers de seguridad", async () => {
    const response = jsonSuccess({ foo: "bar" }, 201)

    expect(response.status).toBe(201)
    expect(response.headers.get("X-Frame-Options")).toBe("DENY")
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
    await expect(response.json()).resolves.toEqual({ success: true, foo: "bar" })
  })

  it("jsonError incluye headers de seguridad", async () => {
    const response = jsonError("boom", 400, { reason: "bad-input" })

    expect(response.status).toBe(400)
    expect(response.headers.get("X-Frame-Options")).toBe("DENY")
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin")
    await expect(response.json()).resolves.toEqual({ error: "boom", reason: "bad-input" })
  })
})
