"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Property } from "@/types/property"
import ConfirmDialog from "@/components/ConfirmDialog"
import { toast } from "sonner"

const statusTranslations: Record<string, string> = {
  available: "Disponible",
  sold: "Vendido",
  rented: "Arrendado",
}

export default function DashboardPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // modal helpers
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

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

  const handleDelete = async (id?: string) => {
    if (!id) return

    setDeleteLoading(true)
    try {
      // call server route which runs with service key and respects auth
      const res = await fetch(`/admin/propiedades/${id}`, { method: "DELETE" })

      // if the request was redirected (e.g. to login page) treat as an auth failure
      if (res.redirected) {
        toast.error("No autenticado. Por favor inicie sesión nuevamente.")
        return
      }

      // ensure the response is JSON (avoid treating an HTML login page as success)
      const contentType = res.headers.get("content-type") || ""
      if (!res.ok || !contentType.includes("application/json")) {
        const body = await res.json().catch(() => ({}))
        toast.error(`No se pudo eliminar: ${body.error || res.statusText}`)
        return
      }

      const body = await res.json().catch(() => ({}))
      if (body.warning) {
        toast.error(`Advertencia: ${body.warning}`)
      } else {
        toast.success("Propiedad eliminada con éxito")
      }

      // update UI only after backend confirms deletion
      setProperties((prev) => prev.filter((p) => p.id !== id))
      setConfirmOpen(false)
      setDeleteId(null)
    } finally {
      setDeleteLoading(false)
    }
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
        <span className="inline-flex items-center gap-2 text-sm font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
          {properties.length} {properties.length === 1 ? "propiedad" : "propiedades"}
        </span>

        <div className="flex gap-4">
          <Link
            href="/admin/propiedades/nueva"
            className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
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

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
                <th className="text-left p-3">Título</th>
                <th className="text-left p-3 hidden sm:table-cell">Área (m²)</th>
                <th className="text-left p-3">Ubicación</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3 hidden sm:table-cell">Teléfono</th>
                <th className="text-left p-3">Precio</th>
                <th className="text-left p-3">Destacada</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
          </thead>

          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="p-3">{property.title}</td>
                <td className="p-3 hidden sm:table-cell">
                  {property.area_m2 ? property.area_m2.toLocaleString() : "—"}
                </td>
                <td className="p-3">{property.location_text}</td>
                <td className="p-3">
                  <span
                    className={
                      "px-2 py-1 rounded-full text-xs font-semibold " +
                      (property.status === "available"
                        ? "bg-green-100 text-green-800"
                        : property.status === "sold"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800")
                    }
                  >
                    {statusTranslations[property.status]}
                  </span>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  {property.contact_phone || "—"}
                </td>
                <td className="p-3">
                  {property.currency} {property.price?.toLocaleString()}
                </td>
                <td className="p-3">
                  {property.highlighted ? (
                    <svg
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.374 2.455a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.54 1.118l-3.374-2.455a1 1 0 00-1.176 0l-3.374 2.455c-.784.57-1.84-.197-1.54-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.363 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
                    </svg>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>

                <td className="p-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/propiedades/${property.id}/editar`}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg transition border border-blue-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </Link>

                    <button
                      onClick={() => {
                        setDeleteId(property.id)
                        setConfirmOpen(true)
                      }}
                      className="inline-flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition border border-red-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
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

      {/* confirmation dialog */}
      <ConfirmDialog
        open={confirmOpen}
        loading={deleteLoading}
        message="Esta acción no se puede deshacer"
        onConfirm={() => handleDelete(deleteId || undefined)}
        onCancel={() => {
          setConfirmOpen(false)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
