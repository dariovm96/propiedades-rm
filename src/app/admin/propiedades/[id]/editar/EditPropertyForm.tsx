"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { uploadImages, deleteMultipleImages } from "@/lib/storage"
import LoadingSpinner from "@/components/LoadingSpinner"
import { Property } from "@/types/property"

type Props = {
  property: Property
}

export default function EditPropertyForm({ property }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: property.title,
    description: property.description || "",
    location_text: property.location_text || "",
    price: property.price?.toString() || "",
    currency: property.currency || "CLP",
    status: property.status,
    area_m2: property.area_m2?.toString() || "",
    highlighted: property.highlighted,
    contact_phone: property.contact_phone || "",
  })

  const [imagesFiles, setImagesFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(
    property.images || []
  )
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setImagesFiles(Array.from(e.target.files))
  }

  const handleRemoveImage = (imagePath: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== imagePath))
    setImagesToDelete((prev) => [...prev, imagePath])
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

      const { error } = await supabase
        .from("properties")
        .update({
          title: form.title,
          description: form.description || null,
          location_text: form.location_text || null,
          price: form.price ? Number(form.price) : null,
          currency: form.currency || null,
          status: form.status,
          area_m2: form.area_m2 ? Number(form.area_m2) : null,
          highlighted: form.highlighted,
          contact_phone: form.contact_phone || null,
          images: updatedImages,
        })
        .eq("id", property.id)

      if (error) throw error

      toast.success("Propiedad actualizada correctamente")
      router.push("/admin/dashboard")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Editar propiedad</h2>
          <p className="text-sm text-gray-600">
            Actualiza la informacion y las imagenes segun sea necesario.
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
          <h3 className="text-sm font-semibold text-gray-900">Informacion principal</h3>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Titulo
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Titulo"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descripcion
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Descripcion"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location_text" className="text-sm font-medium text-gray-700">
              Ubicacion
            </label>
            <input
              id="location_text"
              name="location_text"
              value={form.location_text}
              onChange={handleChange}
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Ubicacion"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Detalles</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="price" className="text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                id="price"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="border p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Precio"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="area_m2" className="text-sm font-medium text-gray-700">
                Superficie (m2)
              </label>
              <input
                id="area_m2"
                type="number"
                name="area_m2"
                value={form.area_m2}
                onChange={handleChange}
                className="border p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-gray-200"
                placeholder="Superficie (m2)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="currency" className="text-sm font-medium text-gray-700">
                Moneda
              </label>
              <select
                id="currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="border p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                value={form.status}
                onChange={handleChange}
                className="border p-3 rounded h-12 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
              value={form.contact_phone}
              onChange={handleChange}
              className="w-full border p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Telefono de contacto (opcional)"
            />
            <p className="text-xs text-gray-500">Opcional. Se muestra en el panel admin.</p>
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

        {existingImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Imagenes actuales</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {existingImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${img}`}
                    alt={`Image ${i + 1}`}
                    className="h-24 w-full object-cover rounded"
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
          <h3 className="text-sm font-semibold text-gray-900">Agregar nuevas imagenes</h3>
          <div className="border border-dashed rounded-lg p-4">
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
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <LoadingSpinner size="md" />}
            {loading ? "Actualizando..." : "Actualizar propiedad"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="border border-gray-300 px-6 py-3 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
