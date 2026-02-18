import { supabase } from "@/lib/supabaseClient"
import { STORAGE_BUCKETS } from "@/lib/constants"

export async function uploadImages(
    propertyId: string,
    files: File[],
    existingImages: string[] = []
): Promise<string[]> {
    const uploadedPaths: string[] = []

    // 🔎 Extraer índices existentes
    const existingIndexes = existingImages
        .map((path) => {
            const fileName = path.split("/").pop() // 1.jpg
            if (!fileName) return null
            const numberPart = fileName.split(".")[0]
            const num = Number(numberPart)
            return isNaN(num) ? null : num
        })
        .filter((n): n is number => n !== null)

    const maxIndex =
        existingIndexes.length > 0 ? Math.max(...existingIndexes) : 0

    let nextIndex = maxIndex + 1

    for (const file of files) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${nextIndex}.${fileExt}`
        const filePath = `${propertyId}/${fileName}`

        const { error } = await supabase.storage
            .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
            .upload(filePath, file, {
                upsert: false, // 🔥 IMPORTANTE: nunca sobrescribir
            })

        if (error) throw error

        uploadedPaths.push(filePath)
        nextIndex++
    }

    return uploadedPaths
}

export async function deleteImage(path: string): Promise<void> {
    const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
        .remove([path])

    if (error) throw error
}

export async function deleteMultipleImages(paths: string[]): Promise<void> {
    if (paths.length === 0) return

    const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
        .remove(paths)

    if (error) throw error
}
