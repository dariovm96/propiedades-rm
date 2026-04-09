import { describe, expect, it, vi } from "vitest"

import { IMAGE_MAX_SIZE_BYTES } from "@/lib/constants"
import { uploadImagesWithServiceRole, validateImageUploadFile } from "@/lib/storage"

function pngBytes(): Uint8Array {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])
}

function jpegBytes(): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0x00])
}

function asBlobPart(bytes: Uint8Array): Blob {
  const buffer = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(buffer).set(bytes)
  return new Blob([buffer])
}

describe("validateImageUploadFile", () => {
  it("acepta imagen con mime y firma válidos", async () => {
    const file = new File([asBlobPart(pngBytes())], "photo.png", { type: "image/png" })

    await expect(validateImageUploadFile(file)).resolves.toEqual({ mimeType: "image/png" })
  })

  it("rechaza tamaño mayor al máximo", async () => {
    const oversized = new Uint8Array(IMAGE_MAX_SIZE_BYTES + 1)
    const file = new File([asBlobPart(oversized)], "oversized.png", { type: "image/png" })

    await expect(validateImageUploadFile(file)).rejects.toThrow(/exceeds the 5MB limit/i)
  })

  it("rechaza cuando la firma no coincide con el mime declarado", async () => {
    const file = new File([asBlobPart(jpegBytes())], "fake.png", { type: "image/png" })

    await expect(validateImageUploadFile(file)).rejects.toThrow("Invalid file signature")
  })
})

describe("uploadImagesWithServiceRole", () => {
  it("sube archivos luego de validar y devuelve paths", async () => {
    const uploadMock = vi.fn(async () => ({ error: null }))
    const storageClient = {
      storage: {
        from: vi.fn(() => ({
          upload: uploadMock,
        })),
      },
    }

    const fileA = new File([asBlobPart(pngBytes())], "a.png", { type: "image/png" })
    const fileB = new File([asBlobPart(pngBytes())], "b.png", { type: "image/png" })

    const paths = await uploadImagesWithServiceRole(storageClient as never, "property-1", [fileA, fileB])

    expect(storageClient.storage.from).toHaveBeenCalledWith("property-images")
    expect(uploadMock).toHaveBeenCalledTimes(2)
    expect(paths).toHaveLength(2)
    expect(paths[0]).toMatch(/^property-1\/.+/)
    expect(paths[1]).toMatch(/^property-1\/.+/)
  })
})
