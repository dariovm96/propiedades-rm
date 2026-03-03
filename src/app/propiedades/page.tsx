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
    .returns<Property[]>()
    .order("created_at", { ascending: false })
    .range(from, to)

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
      .returns<PropertyHighlight[]>()

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
    <section className="space-y-8 sm:space-y-10">
      <div className="space-y-5">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-content-primary sm:text-4xl">
            Propiedades disponibles
          </h1>

          <p className="max-w-2xl text-sm text-content-secondary sm:text-base">
            Explora nuestro catálogo y encuentra opciones verificadas para compra o arriendo.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-0 px-4 py-2 text-sm font-medium text-content-secondary">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          {totalProperties} {totalProperties === 1 ? "propiedad publicada" : "propiedades publicadas"}
        </div>

        <div className="grid gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-[1.8fr_repeat(3,minmax(0,1fr))_auto] sm:p-4">
          <label className="relative sm:col-span-2 lg:col-span-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-secondary">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3-3" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar por comuna, ciudad o código..."
              className="h-11 w-full rounded-xl border border-border-subtle bg-surface-0 pl-9 pr-3 text-sm text-content-primary placeholder:text-content-secondary focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </label>

          <select className="h-11 rounded-xl border border-border-subtle bg-surface-0 px-3 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option>Rango de precio</option>
          </select>

          <select className="h-11 rounded-xl border border-border-subtle bg-surface-0 px-3 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option>Tipo de propiedad</option>
          </select>

          <select className="h-11 rounded-xl border border-border-subtle bg-surface-0 px-3 text-sm text-content-primary focus:outline-none focus:ring-2 focus:ring-brand-300">
            <option>Habitaciones y baños</option>
          </select>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-800"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 6h16" strokeLinecap="round" />
              <path d="M7 12h10" strokeLinecap="round" />
              <path d="M10 18h4" strokeLinecap="round" />
            </svg>
            Filtros
          </button>
        </div>

      </div>

      {totalProperties === 0 ? (
        <div className="rounded-2xl border border-border-subtle border-dashed bg-surface-0 p-8 sm:p-10 text-center">
          <p className="text-content-secondary text-sm sm:text-base">
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-0 text-content-secondary hover:text-content-primary"
              aria-label="Página anterior"
            >
              ‹
            </Link>
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-0 text-content-secondary/50">
              ‹
            </span>
          )}

          {paginationItems.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1 text-content-secondary">…</span>
            ) : item === currentPage ? (
              <span
                key={item}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-brand-700 px-2 text-sm font-semibold text-white"
              >
                {item}
              </span>
            ) : (
              <Link
                key={item}
                href={buildPageHref(resolvedSearchParams, item)}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-0 px-2 text-sm text-content-secondary hover:text-content-primary"
              >
                {item}
              </Link>
            )
          )}

          {currentPage < totalPages ? (
            <Link
              href={buildPageHref(resolvedSearchParams, nextPage)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-0 text-content-secondary hover:text-content-primary"
              aria-label="Página siguiente"
            >
              ›
            </Link>
          ) : (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-0 text-content-secondary/50">
              ›
            </span>
          )}
        </div>
      )}
    </section>
  )
}
