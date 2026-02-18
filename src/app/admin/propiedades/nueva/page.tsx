"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { uploadImages } from "@/lib/storage"

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

      // 🔎 VERIFICAR USUARIO AUTENTICADO
      const { data: userData } = await supabase.auth.getUser()

      // 1️⃣ INSERTAR PROPIEDAD PRIMERO CON IMÁGENES VACÍAS
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

      // 2️⃣ SUBIR IMÁGENES USANDO EL ID DE LA PROPIEDAD
      let imagePaths: string[] = []
      if (imagesFiles.length > 0) {
        imagePaths = await uploadImages(propertyId, imagesFiles)
      }

      // 3️⃣ ACTUALIZAR PROPIEDAD CON LAS IMÁGENES
      const { error: updateError } = await supabase
        .from("properties")
        .update({ images: imagePaths })
        .eq("id", propertyId)

      if (updateError) throw updateError

      toast.success("Propiedad creada correctamente")
      router.push("/admin/dashboard")
    } catch (error: any) {
      console.error("Error al insertar:", error)
      alert(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Nueva Propiedad</h1>
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
          placeholder="Título"
          required
          className="w-full border p-3 rounded"
          value={form.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Descripción"
          rows={4}
          className="w-full border p-3 rounded"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="location_text"
          placeholder="Ubicación"
          className="w-full border p-3 rounded"
          value={form.location_text}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            name="price"
            placeholder="Precio"
            type="number"
            className="border p-3 rounded"
            value={form.price}
            onChange={handleChange}
          />

          <input
            name="area_m2"
            placeholder="Superficie (m²)"
            type="number"
            className="border p-3 rounded"
            value={form.area_m2}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <select
            name="currency"
            className="border p-3 rounded"
            value={form.currency}
            onChange={handleChange}
          >
            <option value="CLP">CLP</option>
            <option value="UF">UF</option>
            <option value="USD">USD</option>
          </select>

          <select
            name="status"
            className="border p-3 rounded"
            value={form.status}
            onChange={handleChange}
          >
            <option value="available">Disponible</option>
            <option value="sold">Vendida</option>
            <option value="rented">Arrendada</option>
          </select>
        </div>

        <input
          name="contact_phone"
          placeholder="Teléfono de contacto (opcional)"
          className="w-full border p-3 rounded"
          value={form.contact_phone}
          onChange={handleChange}
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

        <div>
          <label className="block mb-2 font-medium">
            Imágenes de la propiedad
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
            className="w-full"
          />

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
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

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded"
        >
          {loading ? "Guardando..." : "Crear propiedad"}
        </button>
      </form>
    </div>
  )
}

