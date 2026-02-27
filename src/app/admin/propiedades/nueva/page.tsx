"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { uploadImages } from "@/lib/storage"
import LoadingSpinner from "@/components/LoadingSpinner"

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

  const [form, setForm] = useState({
    title: "",
    description: "",
    location_text: "",
    price: "",
    currency: "CLP",
    status: "available",
    area_m2: "",
    highlighted: false,
    contact_phone: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const files = Array.from(e.target.files)
    setImagesFiles(files)

    const previews = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls(previews)
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
            title: form.title,
            slug,
            description: form.description || null,
            location_text: form.location_text || null,
            price: form.price ? Number(form.price) : null,
            currency: form.currency || null,
            status: form.status,
            area_m2: form.area_m2 ? Number(form.area_m2) : null,
            highlighted: form.highlighted,
            contact_phone: form.contact_phone || null,
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
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Nueva propiedad</h1>
          <p className="text-sm text-gray-600">
            Completa la informacion basica y agrega imagenes para publicar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
        >
          <span aria-hidden="true">←</span>
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 sm:p-8 space-y-8">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Informacion principal</h2>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Titulo
            </label>
            <input
              id="title"
              name="title"
              placeholder="Ej: Departamento con vista al mar"
              required
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descripcion
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe los principales atributos de la propiedad"
              rows={4}
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location_text" className="text-sm font-medium text-gray-700">
              Ubicacion
            </label>
            <input
              id="location_text"
              name="location_text"
              placeholder="Ej: Las Condes, Santiago"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={form.location_text}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Detalles</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="price" className="text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                id="price"
                name="price"
                placeholder="Ej: 125000000"
                type="number"
                className="border p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="area_m2" className="text-sm font-medium text-gray-700">
                Superficie (m2)
              </label>
              <input
                id="area_m2"
                name="area_m2"
                placeholder="Ej: 85"
                type="number"
                className="border p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={form.area_m2}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="currency" className="text-sm font-medium text-gray-700">
                Moneda
              </label>
              <select
                id="currency"
                name="currency"
                className="border p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={form.currency}
                onChange={handleChange}
              >
                <option value="CLP">CLP</option>
                <option value="UF">UF</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                id="status"
                name="status"
                className="border p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-gray-200"
                value={form.status}
                onChange={handleChange}
              >
                <option value="available">Disponible</option>
                <option value="sold">Vendida</option>
                <option value="rented">Arrendada</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contact_phone" className="text-sm font-medium text-gray-700">
              Telefono de contacto
            </label>
            <input
              id="contact_phone"
              name="contact_phone"
              placeholder="Ej: +56 9 1234 5678"
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
              value={form.contact_phone}
              onChange={handleChange}
            />
            <p className="text-xs text-gray-500">Opcional. Si se muestra, se ve en el panel admin.</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.highlighted}
              onChange={(e) => setForm({ ...form, highlighted: e.target.checked })}
            />
            Destacar propiedad
          </label>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Imagenes</h2>
          <div className="border border-dashed rounded-lg p-4">
            <label className="block mb-2 font-medium text-gray-700">
              Imagenes de la propiedad
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 cursor-pointer transition text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Seleccionar imagenes
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="sr-only"
                />
              </label>
              <span className="text-xs text-gray-500">
                {imagesFiles.length > 0
                  ? `${imagesFiles.length} archivo(s) seleccionado(s)`
                  : "Ningun archivo seleccionado"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Maximo 5 MB por imagen. JPG, PNG o WEBP.</p>
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="preview"
                  className="h-32 w-full object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white px-6 py-3 rounded disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <LoadingSpinner size="md" />}
            {loading ? "Guardando..." : "Crear propiedad"}
          </button>
        </div>
      </form>
    </div>
  )
}
