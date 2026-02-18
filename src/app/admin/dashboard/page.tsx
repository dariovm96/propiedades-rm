"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Property } from "@/types/property"

const statusTranslations: Record<string, string> = {
  available: "Disponible",
  sold: "Vendido",
  rented: "Arrendado",
}

export default function DashboardPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })

      if (!data) {
        console.error(error)
      } else {
        setProperties(data)
      }

      setLoading(false)
    }

    fetchProperties()
  }, [])

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("¿Eliminar propiedad?")
    if (!confirmDelete) return

    await supabase.from("properties").delete().eq("id", id)

    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (loading) return <div className="p-10">Cargando...</div>

  return (
    <div className="max-w-6xl mx-auto py-12 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <div className="flex gap-4">
          <Link
            href="/admin/propiedades/nueva"
            className="bg-black text-white px-4 py-2 rounded"
          >
            Nueva propiedad
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Título</th>
              <th className="text-left p-3">Ubicación</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Precio</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-t">
                <td className="p-3">{property.title}</td>
                <td className="p-3">{property.location_text}</td>
                <td className="p-3">{statusTranslations[property.status]}</td>
                <td className="p-3">
                  {property.currency} {property.price?.toLocaleString()}
                </td>

                <td className="p-3 space-x-3">
                  <Link
                    href={`/admin/propiedades/${property.id}/editar`}
                    className="text-blue-600"
                  >
                    Editar
                  </Link>

                  <button
                    onClick={() => handleDelete(property.id)}
                    className="text-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {properties.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No hay propiedades aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
