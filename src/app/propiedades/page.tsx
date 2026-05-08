export const revalidate = 60 // cache propiedades list for one minute

import { supabase } from "@/lib/supabase"
import PropertyGrid from "@/components/PropertyGrid"
import { Property } from "@/types/property"
import { PropertyHighlight } from "@/types/property-highlight"
import Link from "next/link"

const PAGE_SIZE = 6

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function getPageFromSearchParams(searchParams: Record<string, string | string[] | undefined>) {
  const rawPage = searchParams.page
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage
  const parsed = Number.parseInt(pageValue || "1", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

function buildPageHref(searchParams: Record<string, string | string[] | undefined>, page: number) {
  const query = new URLSearchParams()

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "page" || value == null) return

    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item))
      return
    }

    query.set(key, value)
  })

  if (page > 1) {
    query.set("page", String(page))
  }

  const queryString = query.toString()
  return queryString ? `/propiedades?${queryString}` : "/propiedades"
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const items: Array<number | "ellipsis"> = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    items.push("ellipsis")
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (end < totalPages - 1) {
    items.push("ellipsis")
  }

  items.push(totalPages)
  return items
}

export default async function PropiedadesPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams
  const requestedPage = getPageFromSearchParams(resolvedSearchParams)

  const { count, error: countError } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })

  if (countError) {
    return <p>Error cargando propiedades</p>
  }

  const totalProperties = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalProperties / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to)
    .overrideTypes<Property[], { merge: false }>()

  if (error) {
    return <p>Error cargando propiedades</p>
  }

  const properties = data ?? []

  const propertyIds = properties.map((property) => property.id)
  let highlightsByPropertyId = new Map<string, string[]>()

  if (propertyIds.length > 0) {
    const { data: highlightsData } = await supabase
      .from("property_highlights")
      .select("*")
      .order("sort_order", { ascending: true })
      .in("property_id", propertyIds)
      .overrideTypes<PropertyHighlight[], { merge: false }>()

    highlightsByPropertyId = (highlightsData ?? []).reduce<Map<string, string[]>>((acc, item) => {
      const value =
        item.highlight || item.text || item.title || item.label || item.name || item.value || item.description

      if (!value || !item.property_id) {
        return acc
      }

      const trimmed = value.trim()
      if (!trimmed) {
        return acc
      }

      const previous = acc.get(item.property_id) ?? []
      acc.set(item.property_id, [...previous, trimmed])
      return acc
    }, new Map<string, string[]>())
  }

  const propertiesWithHighlights = properties.map((property) => ({
    ...property,
    highlights: highlightsByPropertyId.get(property.id) ?? [],
  }))

  const paginationItems = getPaginationItems(currentPage, totalPages)
  const previousPage = Math.max(1, currentPage - 1)
  const nextPage = Math.min(totalPages, currentPage + 1)

return (
    <section className="space-y-8 sm:space-y-10 py-4 sm:py-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="border-l-2 border-brand-client-400 pl-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-client-600">Catálogo de propiedades</p>
          <h1 className="font-display text-2xl font-400 tracking-tight text-content-primary sm:text-3xl lg:text-4xl">
            Propiedades disponibles
          </h1>

          <p className="max-w-2xl text-sm text-content-secondary lg:text-base">
            Explora nuestro catálogo y encuentra opciones verificadas para compra o arriendo.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-2xl bg-surface-0 px-4 py-2.5 text-sm font-medium text-content-secondary shadow-card">
          <span className="inline-flex h-2 w-2 rounded-full bg-brand-client-400" aria-hidden="true" />
          {totalProperties} {totalProperties === 1 ? "propiedad publicada" : "propiedades publicadas"}
        </div>

        <div className="grid gap-3 rounded-2xl bg-surface-2 p-3 shadow-card sm:grid-cols-2 lg:grid-cols-[1.8fr_repeat(3,minmax(0,1fr))_auto] sm:p-4">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por comuna, ciudad o código..."
              className="h-11 w-full rounded-xl border border-neutral-200 bg-surface-0 pl-9 pr-3 text-sm text-content-primary placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
          </label>

          <select className="h-11 rounded-xl border border-neutral-200 bg-surface-0 px-3 text-sm text-content-primary focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200">
            <option>Rango de precio</option>
          </select>

          <select className="h-11 rounded-xl border border-neutral-200 bg-surface-0 px-3 text-sm text-content-primary focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200">
            <option>Tipo de propiedad</option>
          </select>

          <select className="h-11 rounded-xl border border-neutral-200 bg-surface-0 px-3 text-sm text-content-primary focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200">
            <option>Habitaciones y baños</option>
          </select>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-client-500 px-4 text-sm font-medium text-white transition hover:bg-brand-client-600 btn-press"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M4 6h16" strokeLinecap="round" />
              <path d="M7 12h10" strokeLinecap="round" />
              <path d="M10 18h4" strokeLinecap="round" />
            </svg>
            Filtros
          </button>
        </div>
      </div>

      {totalProperties === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-surface-0 p-10 text-center shadow-card sm:p-12">
          <svg className="mx-auto mb-4 h-12 w-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-sm text-neutral-500 sm:text-base">
            Aún no hay propiedades publicadas.
          </p>
        </div>
      ) : (
        <PropertyGrid properties={propertiesWithHighlights} />
      )}

      {totalProperties > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={buildPageHref(resolvedSearchParams, previousPage)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-0 text-neutral-600 shadow-card transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Página anterior"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-0 text-neutral-300 shadow-card">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </span>
          )}

          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                …
              </span>
            ) : item === currentPage ? (
              <span
                key={item}
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand-client-500 px-3 text-sm font-medium text-white shadow-card"
              >
                {item}
              </span>
            ) : (
              <Link
                key={item}
                href={buildPageHref(resolvedSearchParams, item)}
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-surface-0 px-3 text-sm font-medium text-neutral-600 shadow-card transition hover:bg-neutral-100 hover:text-neutral-900"
              >
                {item}
              </Link>
            )
          )}

          {currentPage < totalPages ? (
            <Link
              href={buildPageHref(resolvedSearchParams, nextPage)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-0 text-neutral-600 shadow-card transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Página siguiente"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface-0 text-neutral-300 shadow-card">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      )}
    </section>
  )
}
