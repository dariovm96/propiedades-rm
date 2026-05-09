"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Property } from "@/types/property"
import ConfirmDialog from "@/components/ConfirmDialog"
import { toast } from "sonner"
import { PROPERTY_STATUS_BADGE_CLASSES, PROPERTY_STATUS_LABELS } from "@/lib/constants"

export default function DashboardPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 5

  // modal helpers
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [highlightConfirmOpen, setHighlightConfirmOpen] = useState(false)
  const [highlightTarget, setHighlightTarget] = useState<{ id: string; nextHighlighted: boolean } | null>(null)
  const [highlightLoading, setHighlightLoading] = useState(false)

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })
        .overrideTypes<Property[], { merge: false }>()

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
      setProperties((prev) => {
        const next = prev.filter((p) => p.id !== id)
        const nextTotalPages = Math.max(1, Math.ceil(next.length / ITEMS_PER_PAGE))
        setCurrentPage((page) => Math.min(page, nextTotalPages))
        return next
      })
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

  const requestHighlightToggle = (property: Property) => {
    setHighlightTarget({
      id: property.id,
      nextHighlighted: !property.highlighted,
    })
    setHighlightConfirmOpen(true)
  }

  const handleToggleHighlight = async () => {
    if (!highlightTarget) return

    setHighlightLoading(true)
    try {
      const res = await fetch(`/admin/propiedades/${highlightTarget.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ highlighted: highlightTarget.nextHighlighted }),
      })

      if (res.redirected) {
        toast.error("No autenticado. Por favor inicie sesión nuevamente.")
        return
      }

      const contentType = res.headers.get("content-type") || ""
      if (!res.ok || !contentType.includes("application/json")) {
        const body = await res.json().catch(() => ({}))
        toast.error(`No se pudo actualizar destacada: ${body.error || res.statusText}`)
        return
      }

      setProperties((prev) =>
        prev.map((property) =>
          property.id === highlightTarget.id
            ? { ...property, highlighted: highlightTarget.nextHighlighted }
            : property
        )
      )

      if (highlightTarget.nextHighlighted) {
        toast.success("Propiedad destacada activada")
      } else {
        toast.success("Propiedad destacada desactivada")
      }

      setHighlightConfirmOpen(false)
      setHighlightTarget(null)
    } finally {
      setHighlightLoading(false)
    }
  }

  if (loading) return <div className="p-10 text-slate-900 dark:text-content-primary">Cargando...</div>

  const totalPages = Math.max(1, Math.ceil(properties.length / ITEMS_PER_PAGE))
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const paginatedProperties = properties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 text-slate-900 dark:text-content-primary">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <span className="inline-flex items-center gap-2 text-sm font-semibold bg-brand-100 text-brand-700 px-3 py-1 rounded-full dark:bg-surface-2 dark:text-content-primary">
            <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
            {properties.length} {properties.length === 1 ? "propiedad" : "propiedades"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/admin/propiedades/nueva"
            className="inline-flex items-center justify-center gap-2 bg-brand-700 text-white px-4 py-2 rounded hover:bg-brand-800 transition dark:bg-[#372e23] dark:hover:bg-[#443a29]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva propiedad
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="border border-brand-200 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-surface-1 dark:border-border-default">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm divide-y divide-brand-200 dark:divide-border-default">
          <thead className="bg-[#25394A] text-white dark:bg-[#25394A] dark:text-slate-100">
            <tr>
                <th className="text-left p-3">Título</th>
                <th className="text-left p-3 hidden sm:table-cell">Área (m²)</th>
                <th className="text-left p-3">Ubicación</th>
                <th className="text-left p-3">Estado</th>
                <th className="text-left p-3 hidden sm:table-cell">Teléfono</th>
                <th className="text-left p-3">Precio</th>
                <th className="text-center p-3">Destacada</th>
                <th className="text-left p-3">Acciones</th>
              </tr>
          </thead>

          <tbody>
            {paginatedProperties.map((property) => (
              <tr key={property.id} className="odd:bg-white even:bg-brand-100/45 hover:bg-brand-200/35 dark:odd:bg-surface-1 dark:even:bg-surface-2/30 dark:hover:bg-surface-3/50">
                <td className="p-3">{property.title}</td>
                <td className="p-3 hidden sm:table-cell">
                  {property.area_m2 ? property.area_m2.toLocaleString() : "—"}
                </td>
                <td className="p-3">{property.location_text}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${PROPERTY_STATUS_BADGE_CLASSES[property.status]}`}
                  >
                    {PROPERTY_STATUS_LABELS[property.status]}
                  </span>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  {property.contact_phone || "—"}
                </td>
                <td className="p-3">
                  {property.price ? `$${property.price.toLocaleString()}` : "—"}
                </td>
                <td className="p-3 text-center">
                  {(() => {
                    const isRowToggleLoading =
                      highlightLoading && highlightTarget?.id === property.id

                    return (
                  <button
                    type="button"
                    onClick={() => requestHighlightToggle(property)}
                    disabled={isRowToggleLoading}
                    className="inline-flex items-center justify-center rounded p-1 hover:bg-brand-100 dark:hover:bg-surface-3 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label={property.highlighted ? "Quitar destacada" : "Marcar como destacada"}
                    title={property.highlighted ? "Quitar destacada" : "Marcar como destacada"}
                  >
                    {property.highlighted ? (
                      <svg
                        className="w-5 h-5 text-brand-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.374 2.455a1 1 0 00-.364 1.118l1.286 3.96c.3.921-.755 1.688-1.54 1.118l-3.374-2.455a1 1 0 00-1.176 0l-3.374 2.455c-.784.57-1.84-.197-1.54-1.118l1.286-3.96a1 1 0 00-.364-1.118L2.363 9.387c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.96z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-brand-muted dark:text-content-secondary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.01 6.18a1 1 0 00.95.69h6.497c.969 0 1.371 1.24.588 1.81l-5.255 3.818a1 1 0 00-.364 1.118l2.01 6.18c.3.921-.755 1.688-1.54 1.118l-5.255-3.818a1 1 0 00-1.176 0l-5.255 3.818c-.784.57-1.84-.197-1.54-1.118l2.01-6.18a1 1 0 00-.364-1.118L1.004 11.607c-.783-.57-.38-1.81.588-1.81h6.497a1 1 0 00.95-.69l2.01-6.18z" />
                      </svg>
                    )}
                  </button>
                    )
                  })()}
                </td>

                <td className="p-3">
                  <div className="flex flex-nowrap gap-2">
                    {property.slug && (
                      <Link
                        href={`/propiedades/${property.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50"
                        title="Ver propiedad"
                        aria-label={`Ver ${property.title}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </Link>
                    )}

                    <Link
                      href={`/admin/propiedades/${property.id}/editar`}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
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
                      className="inline-flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg transition border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50 dark:border-red-800"
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
                <td colSpan={8} className="p-6 text-center text-brand-muted dark:text-content-muted">
                  No hay propiedades aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {properties.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-brand-muted dark:text-content-secondary">
            Página {currentPage} de {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded border border-brand-300 text-brand-700 bg-white hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-surface-2 dark:text-content-primary dark:border-border-default dark:hover:bg-surface-3"
            >
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((pageNumber) => {
                const isActive = pageNumber === currentPage

                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    aria-current={isActive ? "page" : undefined}
                    className={`min-w-9 px-3 py-2 rounded border transition ${
                      isActive
                        ? "bg-brand-700 text-white border-brand-700 dark:bg-[#372e23] dark:border-[#372e23]"
                        : "bg-white text-brand-700 border-brand-300 hover:bg-brand-50 dark:bg-surface-2 dark:text-content-primary dark:border-border-default dark:hover:bg-surface-3"
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded border border-brand-300 text-brand-700 bg-white hover:bg-brand-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-surface-2 dark:text-content-primary dark:border-border-default dark:hover:bg-surface-3"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

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

      <ConfirmDialog
        open={highlightConfirmOpen}
        title={highlightTarget?.nextHighlighted ? "Activar destacada" : "Desactivar destacada"}
        message={
          highlightTarget?.nextHighlighted
            ? "¿Confirmas marcar esta propiedad como destacada?"
            : "¿Confirmas quitar esta propiedad de destacadas?"
        }
        loading={highlightLoading}
        confirmLabel={highlightTarget?.nextHighlighted ? "Activar" : "Desactivar"}
        confirmIntent="primary"
        onConfirm={handleToggleHighlight}
        onCancel={() => {
          if (highlightLoading) return
          setHighlightConfirmOpen(false)
          setHighlightTarget(null)
        }}
      />
    </div>
  )
}
