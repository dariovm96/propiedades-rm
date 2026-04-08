import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

import { resetRateLimitStore } from "@/lib/admin/rate-limit"

const createRouteSupabaseClientMock = vi.fn(async () => ({ auth: { getUser: vi.fn() } }))
const requireServiceRoleClientMock = vi.fn()
const requireAdminUserMock = vi.fn(async () => ({ user: { email: "admin@example.com" } }))

vi.mock("@/lib/server-supabase", () => ({
  createRouteSupabaseClient: createRouteSupabaseClientMock,
  requireServiceRoleClient: requireServiceRoleClientMock,
}))

vi.mock("@/lib/admin-auth", () => ({
  requireAdminUser: requireAdminUserMock,
}))

function buildCreatePropertyClient() {
  return {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(async () => ({
            data: { id: "property-1" },
            error: null,
          })),
        })),
      })),
    })),
  }
}

function buildUpdatePropertyClient() {
  return {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(async () => ({
            data: [{ id: "property-1", highlighted: true }],
            error: null,
          })),
        })),
      })),
    })),
  }
}

function assertResponse(value: Response | undefined): asserts value is Response {
  if (!value) {
    throw new Error("Expected route handler to return a Response")
  }
}

function withSameOriginHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    origin: "http://localhost:3000",
    referer: "http://localhost:3000/admin/dashboard",
    ...extra,
  }
}

describe("admin routes security integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRateLimitStore()
  })

  it("responde 500 uniforme cuando falta service-role key en rutas admin migradas", async () => {
    requireServiceRoleClientMock.mockImplementation(() => {
      throw new Error("server misconfiguration")
    })

    const [{ POST: postCreate }, { PATCH }, { POST: postHighlight }] = await Promise.all([
      import("@/app/admin/propiedades/route"),
      import("@/app/admin/propiedades/[id]/route"),
      import("@/app/admin/propiedades/[id]/highlights/route"),
    ])

    const createRequest = new NextRequest("http://localhost:3000/admin/propiedades", {
      method: "POST",
      headers: withSameOriginHeaders({
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      }),
      body: JSON.stringify({ property_type: "departamento" }),
    })

    const patchRequest = new NextRequest("http://localhost:3000/admin/propiedades/abc", {
      method: "PATCH",
      headers: withSameOriginHeaders({
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      }),
      body: JSON.stringify({ highlighted: true }),
    })

    const highlightRequest = new NextRequest("http://localhost:3000/admin/propiedades/abc/highlights", {
      method: "POST",
      headers: withSameOriginHeaders({
        "content-type": "application/json",
        "x-forwarded-for": "127.0.0.1",
      }),
      body: JSON.stringify({ text: "Pileta" }),
    })

    const [createResponse, patchResponse, highlightResponse] = await Promise.all([
      postCreate(createRequest),
      PATCH(patchRequest, { params: Promise.resolve({ id: "abc" }) }),
      postHighlight(highlightRequest, { params: Promise.resolve({ id: "abc" }) }),
    ])

    assertResponse(createResponse)
    assertResponse(patchResponse)
    assertResponse(highlightResponse)

    const [createBody, patchBody, highlightBody] = await Promise.all([
      createResponse.json(),
      patchResponse.json(),
      highlightResponse.json(),
    ])

    expect(createResponse.status).toBe(500)
    expect(patchResponse.status).toBe(500)
    expect(highlightResponse.status).toBe(500)
    expect(createResponse.headers.get("X-Frame-Options")).toBe("DENY")
    expect(patchResponse.headers.get("X-Frame-Options")).toBe("DENY")
    expect(highlightResponse.headers.get("X-Frame-Options")).toBe("DENY")

    expect(createBody).toEqual({ error: "server misconfiguration" })
    expect(patchBody).toEqual({ error: "server misconfiguration" })
    expect(highlightBody).toEqual({ error: "server misconfiguration" })
  })

  it("pasa de 200 a 429 al exceder umbral en PATCH /admin/propiedades/:id", async () => {
    requireServiceRoleClientMock.mockReturnValue(buildUpdatePropertyClient())
    const { PATCH } = await import("@/app/admin/propiedades/[id]/route")

    for (let index = 0; index < 30; index += 1) {
      const response = await PATCH(
        new NextRequest("http://localhost:3000/admin/propiedades/abc", {
          method: "PATCH",
          headers: withSameOriginHeaders({
            "content-type": "application/json",
            "x-forwarded-for": "127.0.0.1",
          }),
          body: JSON.stringify({ highlighted: true }),
        }),
        { params: Promise.resolve({ id: "abc" }) }
      )

      assertResponse(response)
      expect(response.status).toBe(200)
    }

    const blockedResponse = await PATCH(
      new NextRequest("http://localhost:3000/admin/propiedades/abc", {
        method: "PATCH",
        headers: withSameOriginHeaders({
          "content-type": "application/json",
          "x-forwarded-for": "127.0.0.1",
        }),
        body: JSON.stringify({ highlighted: true }),
      }),
      { params: Promise.resolve({ id: "abc" }) }
    )

    assertResponse(blockedResponse)
    expect(blockedResponse.status).toBe(429)
    expect(blockedResponse.headers.get("Retry-After")).toBeTruthy()
    await expect(blockedResponse.json()).resolves.toEqual({ error: "rate limit exceeded" })
  })

  it("rechaza mutaciones admin con 403 cuando origin/referer no son same-origin", async () => {
    requireServiceRoleClientMock.mockReturnValue(buildCreatePropertyClient())

    const [{ POST: postCreate }, { PATCH, DELETE }, { POST: postHighlight, DELETE: deleteHighlight }] = await Promise.all([
      import("@/app/admin/propiedades/route"),
      import("@/app/admin/propiedades/[id]/route"),
      import("@/app/admin/propiedades/[id]/highlights/route"),
    ])

    const createResponse = await postCreate(
      new NextRequest("http://localhost:3000/admin/propiedades", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://evil.example" },
        body: JSON.stringify({ property_type: "departamento" }),
      })
    )

    const patchResponse = await PATCH(
      new NextRequest("http://localhost:3000/admin/propiedades/abc", {
        method: "PATCH",
        headers: { "content-type": "application/json", referer: "https://evil.example/hack" },
        body: JSON.stringify({ highlighted: true }),
      }),
      { params: Promise.resolve({ id: "abc" }) }
    )

    const deleteResponse = await DELETE(
      new NextRequest("http://localhost:3000/admin/propiedades/abc", {
        method: "DELETE",
        headers: { origin: "https://evil.example" },
      }),
      { params: Promise.resolve({ id: "abc" }) }
    )

    const highlightPostResponse = await postHighlight(
      new NextRequest("http://localhost:3000/admin/propiedades/abc/highlights", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://evil.example" },
        body: JSON.stringify({ text: "Pileta" }),
      }),
      { params: Promise.resolve({ id: "abc" }) }
    )

    const highlightDeleteResponse = await deleteHighlight(
      new NextRequest("http://localhost:3000/admin/propiedades/abc/highlights?highlightId=h1", {
        method: "DELETE",
        headers: { origin: "https://evil.example" },
      }),
      { params: Promise.resolve({ id: "abc" }) }
    )

    const responses = [
      createResponse,
      patchResponse,
      deleteResponse,
      highlightPostResponse,
      highlightDeleteResponse,
    ]

    for (const response of responses) {
      assertResponse(response)
      expect(response.status).toBe(403)
      expect(response.headers.get("X-Frame-Options")).toBe("DENY")
      await expect(response.json()).resolves.toEqual({ error: "forbidden" })
    }
  })

  it("mantiene GET de highlights operativo sin csrf token", async () => {
    requireServiceRoleClientMock.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(async () => ({ data: [], error: null })),
          })),
        })),
      })),
    })

    const { GET } = await import("@/app/admin/propiedades/[id]/highlights/route")

    const response = await GET(
      new NextRequest("http://localhost:3000/admin/propiedades/abc/highlights", {
        method: "GET",
        headers: { "x-forwarded-for": "127.0.0.1" },
      }),
      { params: Promise.resolve({ id: "abc" }) }
    )

    assertResponse(response)
    expect(response.status).toBe(200)
    expect(response.headers.get("X-Frame-Options")).toBe("DENY")
    await expect(response.json()).resolves.toEqual({ success: true, highlights: [] })
  })
})
