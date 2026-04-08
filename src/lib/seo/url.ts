import type { OperationSlug, PropertySeoRouteInput, PropertySeoSitemapItem, PropertyTypeSlug } from "@/types/property-seo"
import { resolveSeoBaseUrl } from "@/lib/seo/constants"

function sanitizeSegment(segment?: string | null): string {
  if (!segment) return ""
  return segment.trim().replace(/^\/+/, "").replace(/\/+$/, "")
}

function joinUrlParts(parts: Array<string | undefined | null>): string {
  const sanitized = parts.map((part) => sanitizeSegment(part)).filter((part) => part.length > 0)
  return `/${sanitized.join("/")}`
}

export function getCanonicalPath(route: PropertySeoRouteInput): string {
  return joinUrlParts([route.tipo, route.region_slug, route.commune_slug, route.slug])
}

export function getListingPath(input: {
  tipo: PropertyTypeSlug | string
  operacion: OperationSlug | string
  region_slug?: string | null
  commune_slug?: string | null
}): string {
  return joinUrlParts([input.tipo, input.operacion, input.region_slug, input.commune_slug])
}

export function getCanonicalUrl(route: PropertySeoRouteInput): string {
  const base = resolveSeoBaseUrl()
  return new URL(getCanonicalPath(route), `${base}/`).toString()
}

export function getListingUrl(input: {
  tipo: PropertyTypeSlug | string
  operacion: OperationSlug | string
  region_slug?: string | null
  commune_slug?: string | null
}): string {
  const base = resolveSeoBaseUrl()
  return new URL(getListingPath(input), `${base}/`).toString()
}

export function getLegacyPropertyPath(slug: string): string {
  return joinUrlParts(["propiedades", slug])
}

export function getLegacyPropertyUrl(slug: string): string {
  const base = resolveSeoBaseUrl()
  return new URL(getLegacyPropertyPath(slug), `${base}/`).toString()
}

export function toSitemapCanonicalPath(item: PropertySeoSitemapItem): string | null {
  if (!item.slug || !item.region_slug || !item.commune_slug || !item.property_type) {
    return null
  }

  return getCanonicalPath({
    tipo: item.property_type,
    region_slug: item.region_slug,
    commune_slug: item.commune_slug,
    slug: item.slug,
  })
}
