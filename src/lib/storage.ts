import {
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_MB,
  STORAGE_BUCKETS,
} from "@/lib/constants"
import { v4 as uuidv4 } from "uuid"
import type { SupabaseClient } from "@supabase/supabase-js"

type AllowedImageMimeType = (typeof IMAGE_ALLOWED_MIME_TYPES)[number]

type UploadValidationResult = {
  mimeType: AllowedImageMimeType
}

const IMAGE_SIGNATURE_BYTES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
} as const

function hasSignature(buffer: Uint8Array, signature: readonly number[]): boolean {
  if (buffer.length < signature.length) {
    return false
  }

  return signature.every((byte, index) => buffer[index] === byte)
}

function isWebpSignature(buffer: Uint8Array): boolean {
  if (buffer.length < 12) {
    return false
  }

  const riff = String.fromCharCode(...buffer.slice(0, 4))
  const webp = String.fromCharCode(...buffer.slice(8, 12))
  return riff === "RIFF" && webp === "WEBP"
}

async function detectMimeBySignature(file: File): Promise<AllowedImageMimeType | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer())

  if (hasSignature(bytes, IMAGE_SIGNATURE_BYTES["image/jpeg"])) {
    return "image/jpeg"
  }

  if (hasSignature(bytes, IMAGE_SIGNATURE_BYTES["image/png"])) {
    return "image/png"
  }

  if (isWebpSignature(bytes)) {
    return "image/webp"
  }

  return null
}

export async function validateImageUploadFile(file: File): Promise<UploadValidationResult> {
  if (!IMAGE_ALLOWED_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
    throw new Error("Only JPG, PNG and WEBP images are allowed")
  }

  if (file.size > IMAGE_MAX_SIZE_BYTES) {
    throw new Error(`Image \"${file.name}\" exceeds the ${IMAGE_MAX_SIZE_MB}MB limit`)
  }

  const detectedMime = await detectMimeBySignature(file)
  if (!detectedMime || detectedMime !== file.type) {
    throw new Error("Invalid file signature")
  }

  return { mimeType: detectedMime }
}

function buildStoragePath(propertyId: string, fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg"
  return `${propertyId}/${uuidv4()}.${extension}`
}

type ServiceRoleUploadClient = SupabaseClient

export async function uploadImagesWithServiceRole(
  storageClient: ServiceRoleUploadClient,
  propertyId: string,
  files: File[]
): Promise<string[]> {
  for (const file of files) {
    await validateImageUploadFile(file)
  }

  const uploadedPaths: string[] = []

  for (const file of files) {
    const filePath = buildStoragePath(propertyId, file.name)
    const { error } = await storageClient.storage
      .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
      .upload(filePath, file, { upsert: false })

    if (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`)
    }

    uploadedPaths.push(filePath)
  }

  return uploadedPaths
}

async function getBrowserSupabaseClient() {
  const supabaseClientModule = await import("@/lib/supabaseClient")
  return supabaseClientModule.supabase
}

export async function uploadImages(
  propertyId: string,
  files: File[]
): Promise<string[]> {
  const formData = new FormData()
  formData.append("propertyId", propertyId)

  for (const file of files) {
    formData.append("files", file, file.name)
  }

  const response = await fetch("/admin/uploads", {
    method: "POST",
    credentials: "include",
    body: formData,
  })

  const body = (await response.json().catch(() => ({}))) as {
    message?: string
    error?: string
    paths?: string[]
  }

  if (!response.ok || !Array.isArray(body.paths)) {
    throw new Error(body.message || body.error || "Failed to upload images")
  }

  return body.paths
}

export async function deleteImage(path: string): Promise<void> {
  const supabase = await getBrowserSupabaseClient()
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
    .remove([path])

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

export async function deleteMultipleImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return

  const supabase = await getBrowserSupabaseClient()
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
    .remove(paths)

  if (error) {
    throw new Error(`Failed to delete images: ${error.message}`)
  }
}
