"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { uploadImages } from "@/lib/storage"
import LoadingSpinner from "@/components/LoadingSpinner"
import PropertyFormFields from "@/components/PropertyFormFields"
import PropertyHighlightsFields from "@/components/PropertyHighlightsFields"
import ImageFilePicker from "@/components/ImageFilePicker"
import ImageWithLoader from "@/components/ImageWithLoader"
import {
  deriveLocationSlugs,
  normalizePropertySlug,
  PropertyFormValues,
  PropertySeoFieldErrors,
  toPropertyPayload,
  validatePropertySeoMinimums,
} from "@/lib/property-form"
import { createPropertyHighlights } from "@/lib/property-highlights-client"
import { EditablePropertyHighlight } from "@/types/property-highlight"
import { PropertyInsertPayload } from "@/types/property"

export default function NuevaPropiedadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagesFiles, setImagesFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [highlights, setHighlights] = useState<EditablePropertyHighlight[]>([{ text: "" }])
  const [fieldErrors, setFieldErrors] = useState<PropertySeoFieldErrors>({})
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
    region: "",
    commune: "",
    street: "",
    street_number: "",
    price: "",
    status: "available",
    area_m2: "",
    highlighted: false,
    contact_phone: "",
    property_type: "",
    for_sale: true,
    for_rent: false,
    region_slug: "",
    commune_slug: "",
    latitude: "",
    longitude: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    const errorFieldName =
      name === "region" ? "region_slug" : name === "commune" ? "commune_slug" : name

    setFieldErrors((prev) => {
      if (!(errorFieldName in prev)) {
        return prev
      }

      const next = { ...prev }
      delete next[errorFieldName as keyof PropertySeoFieldErrors]
      return next
    })

    if (name === "status") {
      setForm((prev) => ({ ...prev, status: value as PropertyFormValues["status"] }))
      return
    }

    setForm((prev) => {
      const next = { ...prev, [name]: value }

      if (name === "region" || name === "commune") {
        const derived = deriveLocationSlugs({
          regionText: name === "region" ? value : prev.region,
          communeText: name === "commune" ? value : prev.commune,
        })

        next.region_slug = derived.region_slug
        next.commune_slug = derived.commune_slug
      }

      return next
    })
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

    const seoErrors = validatePropertySeoMinimums(form)
    if (Object.keys(seoErrors).length > 0) {
      setFieldErrors(seoErrors)
      toast.error("Completa la dirección y los datos mínimos antes de guardar")
      return
    }

    setLoading(true)

    try {
      const slug = normalizePropertySlug(form.title)

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        toast.error("No autenticado")
        return
      }

      const insertPayload: PropertyInsertPayload = {
        ...toPropertyPayload(form),
        slug,
        images: [],
      }

      const insertResponse = await fetch("/admin/propiedades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(insertPayload),
      })

      if (insertResponse.redirected) {
        throw new Error("No autenticado")
      }

      const insertBody = (await insertResponse.json().catch(() => ({}))) as {
        error?: string
        property?: { id: string }
      }

      if (!insertResponse.ok || !insertBody.property) {
        throw new Error(insertBody.error || "No se pudo crear la propiedad")
      }

      const insertedData = insertBody.property
      if (!insertedData) throw new Error("No property data returned")

      const propertyId = insertedData.id

      let imagePaths: string[] = []
      if (imagesFiles.length > 0) {
        imagePaths = await uploadImages(propertyId, imagesFiles)
      }

      const { error: updateError } = await supabase
        .from("properties")
        .update({ images: imagePaths } satisfies Pick<PropertyInsertPayload, "images">)
        .eq("id", propertyId)

      if (updateError) throw updateError

      await createPropertyHighlights(propertyId, highlights)

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
    <div className="max-w-4xl mx-auto py-12 text-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Nueva propiedad</h1>
          <p className="text-sm text-brand-700 dark:text-slate-300">
            Completa la informacion basica y agrega imagenes para publicar.
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
          onOperationChange={(name, checked) => {
            setForm((prev) => ({ ...prev, [name]: checked }))
            setFieldErrors((prev) => {
              if (!prev.operation) {
                return prev
              }

              const next = { ...prev }
              delete next.operation
              return next
            })
          }}
          fieldErrors={fieldErrors}
        />

        <PropertyHighlightsFields items={highlights} onChange={setHighlights} disabled={loading} />

        <div className="space-y-4">
          <h2 className="rounded-lg border border-brand-200 bg-brand-50/85 px-3 py-2 text-sm font-semibold text-brand-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            Imagenes
          </h2>
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
