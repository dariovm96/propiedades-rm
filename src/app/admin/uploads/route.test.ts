import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const requireAdminUserMock = vi.fn(async () => ({ user: { email: "admin@example.com" } }))
const createRouteSupabaseClientMock = vi.fn(async () => ({ auth: { getUser: vi.fn() } }))
const requireServiceRoleClientMock = vi.fn(() => ({ storage: { from: vi.fn() } }))
const uploadImagesWithServiceRoleMock = vi.fn()

function assertResponse(value: Response | undefined): asserts value is Response {
  if (!value) {
    throw new Error("Expected route handler to return a Response")
  }
}

vi.mock("@/lib/admin-auth", () => ({
  requireAdminUser: requireAdminUserMock,
}))

vi.mock("@/lib/server-supabase", () => ({
  createRouteSupabaseClient: createRouteSupabaseClientMock,
  requireServiceRoleClient: requireServiceRoleClientMock,
}))

vi.mock("@/lib/storage", async () => {
  const actual = await vi.importActual<typeof import("@/lib/storage")>("@/lib/storage")
  return {
    ...actual,
    uploadImagesWithServiceRole: uploadImagesWithServiceRoleMock,
  }
})

function pngBlob(): Blob {
  return new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: "image/png" })
}

describe("POST /admin/uploads", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploadImagesWithServiceRoleMock.mockResolvedValue(["property-1/file-a.png"])
  })

  it("rechaza con 403 si no pasa authz admin", async () => {
    const forbidden = new Response(JSON.stringify({ error: "forbidden" }), { status: 403 })
    requireAdminUserMock.mockResolvedValueOnce({ response: forbidden } as never)

    const { POST } = await import("@/app/admin/uploads/route")
    const formData = new FormData()
    formData.append("propertyId", "property-1")
    formData.append("files", new File([pngBlob()], "a.png", { type: "image/png" }))

    const response = await POST(
      new NextRequest("http://localhost:3000/admin/uploads", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          referer: "http://localhost:3000/admin/dashboard",
        },
        body: formData,
      })
    )

    assertResponse(response)
    expect(response.status).toBe(403)
    expect(uploadImagesWithServiceRoleMock).not.toHaveBeenCalled()
  })

  it("rechaza request inválido sin propertyId", async () => {
    const { POST } = await import("@/app/admin/uploads/route")
    const formData = new FormData()
    formData.append("files", new File([pngBlob()], "a.png", { type: "image/png" }))

    const response = await POST(
      new NextRequest("http://localhost:3000/admin/uploads", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          referer: "http://localhost:3000/admin/dashboard",
        },
        body: formData,
      })
    )

    assertResponse(response)
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: "bad_request",
      })
    )
    expect(uploadImagesWithServiceRoleMock).not.toHaveBeenCalled()
  })

  it("rechaza si uploader reporta error de validación server-side", async () => {
    uploadImagesWithServiceRoleMock.mockRejectedValueOnce(new Error("Invalid file signature"))

    const { POST } = await import("@/app/admin/uploads/route")
    const formData = new FormData()
    formData.append("propertyId", "property-1")
    formData.append("files", new File([pngBlob()], "a.png", { type: "image/png" }))

    const response = await POST(
      new NextRequest("http://localhost:3000/admin/uploads", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          referer: "http://localhost:3000/admin/dashboard",
        },
        body: formData,
      })
    )

    assertResponse(response)
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        error: "bad_request",
        message: "Invalid file signature",
      })
    )
  })

  it("retorna 200 con paths cuando upload es válido", async () => {
    const { POST } = await import("@/app/admin/uploads/route")
    const formData = new FormData()
    formData.append("propertyId", "property-1")
    formData.append("files", new File([pngBlob()], "a.png", { type: "image/png" }))

    const response = await POST(
      new NextRequest("http://localhost:3000/admin/uploads", {
        method: "POST",
        headers: {
          origin: "http://localhost:3000",
          referer: "http://localhost:3000/admin/dashboard",
        },
        body: formData,
      })
    )

    assertResponse(response)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      paths: ["property-1/file-a.png"],
    })
    expect(uploadImagesWithServiceRoleMock).toHaveBeenCalledTimes(1)
  })
})
