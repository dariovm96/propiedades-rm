import { supabase } from "@/lib/supabaseClient"
import { STORAGE_BUCKETS } from "@/lib/constants"
import { v4 as uuidv4 } from "uuid"

/**
 * Configuración de validaciones
 */
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export async function uploadImages(
    propertyId: string,
    files: File[]
): Promise<string[]> {
    const uploadedPaths: string[] = []

    for (const file of files) {

        // 🔐 Validar tipo MIME
        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error(
                "Only JPG, PNG and WEBP images are allowed"
            )
        }

        // 🔐 Validar tamaño
        if (file.size > MAX_SIZE_BYTES) {
            throw new Error(
                `Image "${file.name}" exceeds the ${MAX_SIZE_MB}MB limit`
            )
        }

        // Obtener extensión original
        const originalExt = file.name.split(".").pop()
        const fileExt = originalExt ? originalExt.toLowerCase() : "jpg"

        // Generar nombre único
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = `${propertyId}/${fileName}`

        const { error } = await supabase.storage
            .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
            .upload(filePath, file, {
                upsert: false, // nunca sobreescribir
            })

        if (error) {
            throw new Error(`Failed to upload ${file.name}: ${error.message}`)
        }

        uploadedPaths.push(filePath)
    }

    return uploadedPaths
}

export async function deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
        .remove([path])

    if (error) {
        throw new Error(`Failed to delete image: ${error.message}`)
    }
}

export async function deleteMultipleImages(paths: string[]): Promise<void> {
    if (paths.length === 0) return

    const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
        .remove(paths)

    if (error) {
        throw new Error(`Failed to delete images: ${error.message}`)
    }
}
