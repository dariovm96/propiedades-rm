"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { uploadImages, deleteMultipleImages } from "@/lib/storage"
import LoadingSpinner from "@/components/LoadingSpinner"
import ConfirmDialog from "@/components/ConfirmDialog"
import PropertyFormFields from "@/components/PropertyFormFields"
import PropertyHighlightsFields from "@/components/PropertyHighlightsFields"
import ImageFilePicker from "@/components/ImageFilePicker"
import ImageWithLoader from "@/components/ImageWithLoader"
import { Property } from "@/types/property"
import { PropertyFormValues, toPropertyPayload } from "@/lib/property-form"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import { fetchPropertyHighlights, syncPropertyHighlights } from "@/lib/property-highlights-client"
import { EditablePropertyHighlight } from "@/types/property-highlight"
import { PropertyUpdatePayload } from "@/types/property"

type Props = {
  property: Property
}

export default function EditPropertyForm({ property }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<PropertyFormValues>({
    title: property.title,
    description: property.description || "",
    location_text: property.location_text || "",
    price: property.price?.toString() || "",
    status: property.status,
    area_m2: property.area_m2?.toString() || "",
    highlighted: property.highlighted,
    contact_phone: property.contact_phone || "",
  })

  const [imagesFiles, setImagesFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const previewUrlsRef = useRef<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(
    property.images || []
  )
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [confirmRemoveImageOpen, setConfirmRemoveImageOpen] = useState(false)
  const [imagePendingRemoval, setImagePendingRemoval] = useState<string | null>(null)
  const [highlights, setHighlights] = useState<EditablePropertyHighlight[]>([])
  const [initialHighlights, setInitialHighlights] = useState<EditablePropertyHighlight[]>([])

  useEffect(() => {
    previewUrlsRef.current = previewUrls
  }, [previewUrls])

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadHighlights = async () => {
      try {
        const items = await fetchPropertyHighlights(property.id)
        if (cancelled) {
          return
        }

        const withFallback = items.length > 0 ? items : [{ text: "" }]
        setHighlights(withFallback)
        setInitialHighlights(withFallback)
      } catch {
        if (cancelled) {
          return
        }

        setHighlights([{ text: "" }])
        setInitialHighlights([])
      }
    }

    loadHighlights()

    return () => {
      cancelled = true
    }
  }, [property.id])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    if (name === "status") {
      setForm((prev) => ({ ...prev, status: value as PropertyFormValues["status"] }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImagesSelected = (incomingFiles: File[]) => {
    const fileSignature = (file: File) => `${file.name}-${file.size}-${file.lastModified}`
    const existingSignatures = new Set(imagesFiles.map(fileSignature))

    const uniqueNewFiles = incomingFiles.filter((file) => !existingSignatures.has(fileSignature(file)))
    if (uniqueNewFiles.length === 0) {
      return
    }

    setImagesFiles((prev) => [...prev, ...uniqueNewFiles])
    setPreviewUrls((prev) => [...prev, ...uniqueNewFiles.map((file) => URL.createObjectURL(file))])
  }

  const handleRemoveNewImage = (indexToRemove: number) => {
    setImagesFiles((prev) => prev.filter((_, index) => index !== indexToRemove))

    setPreviewUrls((prev) => {
      const urlToRemove = prev[indexToRemove]
      if (urlToRemove) {
        URL.revokeObjectURL(urlToRemove)
      }

      return prev.filter((_, index) => index !== indexToRemove)
    })
  }

  const handleRemoveImage = (imagePath: string) => {
    setImagePendingRemoval(imagePath)
    setConfirmRemoveImageOpen(true)
  }

  const confirmRemoveImage = () => {
    if (!imagePendingRemoval) {
      return
    }

    const imagePath = imagePendingRemoval
    setExistingImages((prev) => prev.filter((img) => img !== imagePath))
    setImagesToDelete((prev) => [...prev, imagePath])
    setConfirmRemoveImageOpen(false)
    setImagePendingRemoval(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let updatedImages = [...existingImages]

      if (imagesFiles.length > 0) {
        const newImagePaths = await uploadImages(property.id, imagesFiles)
        updatedImages = [...updatedImages, ...newImagePaths]
      }

      if (imagesToDelete.length > 0) {
        await deleteMultipleImages(imagesToDelete)
      }

      const updatePayload: PropertyUpdatePayload = {
        ...toPropertyPayload(form),
        images: updatedImages,
      }

      const { error } = await supabase
        .from("properties")
        .update(updatePayload)
        .eq("id", property.id)

      if (error) throw error

      await syncPropertyHighlights(property.id, initialHighlights, highlights)

      toast.success("Propiedad actualizada correctamente")
      router.push("/admin/dashboard")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ocurrió un error inesperado"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Editar propiedad</h2>
          <p className="text-sm text-brand-700 dark:text-slate-300">
            Actualiza la informacion y las imagenes segun sea necesario.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 bg-brand-100 hover:bg-brand-200 px-3 py-2 rounded-lg transition dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true">←</span>
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-brand-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-8 dark:bg-slate-900 dark:border-slate-700">
        <PropertyFormFields
          form={form}
          onChange={handleChange}
          onHighlightedChange={(checked) => setForm((prev) => ({ ...prev, highlighted: checked }))}
        />

        <PropertyHighlightsFields items={highlights} onChange={setHighlights} disabled={loading} />

        {existingImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="rounded-lg border border-brand-200 bg-brand-50/85 px-3 py-2 text-sm font-semibold text-brand-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              Imagenes actuales
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {existingImages.map((img, i) => (
                <div key={i} className="relative group">
                  <ImageWithLoader
                    src={getPublicImageUrl(img)}
                    alt={`Image ${i + 1}`}
                    wrapperClassName="relative h-24 w-full"
                    width={320}
                    height={96}
                    imageClassName="h-24 w-full object-cover rounded"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="rounded-lg border border-brand-200 bg-brand-50/85 px-3 py-2 text-sm font-semibold text-brand-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            Agregar nuevas imagenes
          </h3>
          <ImageFilePicker selectedCount={imagesFiles.length} onFilesSelected={handleImagesSelected} />

          {previewUrls.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wide dark:text-slate-300">
                Nuevas imagenes seleccionadas
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={url} className="relative h-32 w-full group">
                    <ImageWithLoader
                      src={url}
                      alt={`Nueva imagen ${index + 1}`}
                      wrapperClassName="relative h-full w-full"
                      fill
                      imageClassName="object-cover rounded"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      aria-label={`Quitar nueva imagen ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-700 text-white px-6 py-3 rounded hover:bg-brand-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
          >
            {loading && <LoadingSpinner size="md" />}
            {loading ? "Actualizando..." : "Actualizar propiedad"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="border border-brand-300 text-brand-700 px-6 py-3 rounded hover:bg-brand-100 transition dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmRemoveImageOpen}
        title="Quitar imagen"
        message="¿Deseas quitar esta imagen de la propiedad? El cambio se guardará al actualizar."
        confirmLabel="Quitar imagen"
        loading={loading}
        onConfirm={confirmRemoveImage}
        onCancel={() => {
          if (loading) return
          setConfirmRemoveImageOpen(false)
          setImagePendingRemoval(null)
        }}
      />
    </div>
  )
}
