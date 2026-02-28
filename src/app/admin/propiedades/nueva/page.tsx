"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { uploadImages } from "@/lib/storage"
import LoadingSpinner from "@/components/LoadingSpinner"
import PropertyFormFields from "@/components/PropertyFormFields"
import ImageFilePicker from "@/components/ImageFilePicker"
import ImageWithLoader from "@/components/ImageWithLoader"
import { PropertyFormValues, toPropertyPayload } from "@/lib/property-form"

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export default function NuevaPropiedadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagesFiles, setImagesFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const previewUrlsRef = useRef<string[]>([])

  useEffect(() => {
    previewUrlsRef.current = previewUrls
  }, [previewUrls])

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const [form, setForm] = useState<PropertyFormValues>({
    title: "",
    description: "",
    location_text: "",
    price: "",
    status: "available",
    area_m2: "",
    highlighted: false,
    contact_phone: "",
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const slug = generateSlug(form.title)

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        toast.error("No autenticado")
        return
      }

      const { data: insertedData, error: insertError } = await supabase
        .from("properties")
        .insert([
          {
            ...toPropertyPayload(form),
            slug,
            images: [],
          },
        ])
        .select()
        .single()

      if (insertError) throw insertError
      if (!insertedData) throw new Error("No property data returned")

      const propertyId = insertedData.id

      let imagePaths: string[] = []
      if (imagesFiles.length > 0) {
        imagePaths = await uploadImages(propertyId, imagesFiles)
      }

      const { error: updateError } = await supabase
        .from("properties")
        .update({ images: imagePaths })
        .eq("id", propertyId)

      if (updateError) throw updateError

      toast.success("Propiedad creada correctamente")
      router.push("/admin/dashboard")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ocurrió un error inesperado"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Nueva propiedad</h1>
          <p className="text-sm text-brand-700">
            Completa la informacion basica y agrega imagenes para publicar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 bg-brand-100 hover:bg-brand-200 px-3 py-2 rounded-lg transition"
        >
          <span aria-hidden="true">←</span>
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-brand-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-8">
        <PropertyFormFields
          form={form}
          onChange={handleChange}
          onHighlightedChange={(checked) => setForm((prev) => ({ ...prev, highlighted: checked }))}
        />

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-brand-900">Imagenes</h2>
          <ImageFilePicker
            selectedCount={imagesFiles.length}
            onFilesSelected={handleImagesSelected}
            helperText="Maximo 5 MB por imagen. JPG, PNG o WEBP. Puedes seleccionar en tandas sin mantener Ctrl."
          />

          {previewUrls.length > 0 && (
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
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-700 text-white px-6 py-3 rounded hover:bg-brand-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
          >
            {loading && <LoadingSpinner size="md" />}
            {loading ? "Guardando..." : "Crear propiedad"}
          </button>
        </div>
      </form>
    </div>
  )
}
