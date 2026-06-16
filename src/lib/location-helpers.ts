import { MUNICIPALITY_TO_REGION } from "./constants"

/**
 * Devuelve la región correspondiente a un municipio.
 * Si es "Otra" o desconocido, devuelve string vacío.
 */
export function getRegionForMunicipality(municipality: string | null | undefined): string {
  if (!municipality) return ""
  return MUNICIPALITY_TO_REGION[municipality] ?? ""
}

/**
 * Devuelve el texto de ubicación para mostrar en UI,
 * con fallback a location_text si no hay municipality.
 */
export function getLocationDisplay(
  property: {
    municipality?: string | null
    location_text?: string | null
  }
): string {
  return property.municipality?.trim() || property.location_text?.trim() || ""
}

/**
 * Construye la query de geocodificación a partir de campos estructurados.
 * Fallback a location_text si no hay dirección estructurada.
 */
export function buildGeocodeQuery(
  property: {
    street_address?: string | null
    municipality?: string | null
    region_name?: string | null
    location_text?: string | null
  }
): string {
  const parts = [
    property.street_address?.trim(),
    property.municipality?.trim(),
    property.region_name?.trim(),
  ].filter(Boolean)

  if (parts.length > 0) {
    return parts.join(", ")
  }

  return property.location_text?.trim() || ""
}

/**
 * Construye el objeto address para JSON-LD.
 * Omite campos vacíos para no generar schema.org inválido.
 */
export function buildJsonLdAddress(
  property: {
    municipality?: string | null
    region_name?: string | null
    street_address?: string | null
    location_text?: string | null
  }
): {
  "@type": "PostalAddress"
  addressLocality: string
  addressRegion?: string
  streetAddress?: string
  addressCountry: string
} {
  const addressLocality = property.municipality?.trim() || property.location_text?.trim() || ""

  const result: {
    "@type": "PostalAddress"
    addressLocality: string
    addressRegion?: string
    streetAddress?: string
    addressCountry: string
  } = {
    "@type": "PostalAddress",
    addressLocality,
    addressCountry: "CL",
  }

  const region = property.region_name?.trim()
  if (region) {
    result.addressRegion = region
  }

  const street = property.street_address?.trim()
  if (street) {
    result.streetAddress = street
  }

  return result
}

/**
 * Construye el título SEO con ubicación estructurada.
 * Fallback a location_text si no hay municipality.
 */
export function buildLocationTitle(
  property: {
    municipality?: string | null
    location_text?: string | null
  }
): string {
  return property.municipality?.trim() || property.location_text?.trim() || ""
}

/**
 * Construye la descripción SEO con ubicación estructurada.
 */
export function buildLocationDescription(
  property: {
    municipality?: string | null
    region_name?: string | null
    sector_reference?: string | null
  }
): string {
  const parts: string[] = []

  if (property.municipality?.trim()) {
    parts.push(property.municipality.trim())
  }

  if (property.region_name?.trim()) {
    parts.push(property.region_name.trim())
  }

  if (property.sector_reference?.trim()) {
    parts.push(`Sector ${property.sector_reference.trim()}`)
  }

  return parts.join(". ")
}
