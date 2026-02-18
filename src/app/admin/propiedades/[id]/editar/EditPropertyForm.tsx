"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { uploadImages, deleteMultipleImages } from "@/lib/storage"
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

      // 1️⃣ SUBIR NUEVAS IMÁGENES
      if (imagesFiles.length > 0) {
        const newImagePaths = await uploadImages(property.id, imagesFiles)
        updatedImages = [...updatedImages, ...newImagePaths]
      }

      // 2️⃣ ELIMINAR IMÁGENES MARCADAS
      if (imagesToDelete.length > 0) {
        await deleteMultipleImages(imagesToDelete)
      }

      // 3️⃣ ACTUALIZAR PROPIEDAD
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
      alert(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold">Editar Propiedad</h2>
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="text-gray-600 hover:text-gray-900 transition"
        >
          ← Volver al Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          placeholder="Título"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          placeholder="Descripción"
          rows={4}
        />

        <input
          name="location_text"
          value={form.location_text}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          placeholder="Ubicación"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="border p-3 rounded"
            placeholder="Precio"
          />

          <input
            type="number"
            name="area_m2"
            value={form.area_m2}
            onChange={handleChange}
            className="border p-3 rounded"
            placeholder="Superficie (m²)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="border p-3 rounded"
          >
            <option value="CLP">CLP</option>
            <option value="UF">UF</option>
            <option value="USD">USD</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-3 rounded"
          >
            <option value="available">Disponible</option>
            <option value="sold">Vendida</option>
            <option value="rented">Arrendada</option>
          </select>
        </div>

        <input
          name="contact_phone"
          value={form.contact_phone}
          onChange={handleChange}
          className="w-full border p-3 rounded"
          placeholder="Teléfono de contacto (opcional)"
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.highlighted}
            onChange={(e) =>
              setForm({ ...form, highlighted: e.target.checked })
            }
          />
          <label>Destacar propiedad</label>
        </div>

        {/* IMÁGENES EXISTENTES */}
        {existingImages.length > 0 && (
          <div>
            <p className="font-medium mb-2">Imágenes actuales</p>
            <div className="grid grid-cols-4 gap-3">
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

        {/* NUEVAS IMÁGENES */}
        <div>
          <label className="block font-medium mb-2">Agregar nuevas imágenes</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            className="w-full border p-3 rounded"
          />
          {imagesFiles.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {imagesFiles.length} archivo(s) seleccionado(s)
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded disabled:bg-gray-400"
          >
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

