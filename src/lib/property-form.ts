import type { PropertyStatus } from "@/lib/constants"
import { PropertyFormPayload } from "@/types/property"

export type PropertyFormValues = {
  title: string
  description: string
  location_text: string
  region: string
  commune: string
  street: string
  street_number: string
  price: string
  status: PropertyStatus
  area_m2: string
  highlighted: boolean
  contact_phone: string
  property_type: string
  for_sale: boolean
  for_rent: boolean
  region_slug: string
  commune_slug: string
  latitude: string
  longitude: string
}

export type PropertySeoFieldErrors = Partial<
  Record<
    "property_type" | "operation" | "region_slug" | "commune_slug" | "street" | "street_number" | "latitude" | "longitude",
    string
  >
>

export function normalizePropertySlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function deriveLocationSlugs(input: {
  regionText: string
  communeText: string
}): { region_slug: string; commune_slug: string } {
  return {
    region_slug: normalizePropertySlug(input.regionText),
    commune_slug: normalizePropertySlug(input.communeText),
  }
}

export function parsePropertyCoordinate(value: string): number | null {
  if (!value.trim()) {
    return null
  }

  const normalized = value.replace(",", ".")
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

export function hasValidPropertyCoordinateRange(latitude: number | null, longitude: number | null): boolean {
  if (latitude === null || longitude === null) {
    return false
  }

  return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
}

export function validatePropertySeoMinimums(form: PropertyFormValues): PropertySeoFieldErrors {
  const errors: PropertySeoFieldErrors = {}
  const derivedLocation = deriveLocationSlugs({
    regionText: form.region,
    communeText: form.commune,
  })
  const regionSlug = derivedLocation.region_slug || normalizePropertySlug(form.region_slug)
  const communeSlug = derivedLocation.commune_slug || normalizePropertySlug(form.commune_slug)

  if (!form.property_type.trim()) {
    errors.property_type = "El tipo de propiedad es obligatorio"
  }

  if (!form.for_sale && !form.for_rent) {
    errors.operation = "Debes seleccionar venta o arriendo"
  }

  if (!regionSlug) {
    errors.region_slug = "La región es obligatoria"
  }

  if (!communeSlug) {
    errors.commune_slug = "La comuna es obligatoria"
  }

  if (!form.street.trim()) {
    errors.street = "La calle es obligatoria"
  }

  if (!form.street_number.trim()) {
    errors.street_number = "El número es obligatorio"
  }

  const latitude = parsePropertyCoordinate(form.latitude)
  const longitude = parsePropertyCoordinate(form.longitude)

  if (!hasValidPropertyCoordinateRange(latitude, longitude)) {
    if (latitude === null || Math.abs(latitude) > 90) {
      errors.latitude = "Latitud inválida (rango -90 a 90)"
    }

    if (longitude === null || Math.abs(longitude) > 180) {
      errors.longitude = "Longitud inválida (rango -180 a 180)"
    }
  }

  return errors
}

export function toPropertyPayload(form: PropertyFormValues): PropertyFormPayload {
  const derivedLocation = deriveLocationSlugs({
    regionText: form.region,
    communeText: form.commune,
  })
  const regionSlug = derivedLocation.region_slug || normalizePropertySlug(form.region_slug)
  const communeSlug = derivedLocation.commune_slug || normalizePropertySlug(form.commune_slug)

  return {
    title: form.title,
    description: form.description || null,
    location_text: form.location_text || null,
    price: form.price ? Number(form.price) : null,
    status: form.status,
    area_m2: form.area_m2 ? Number(form.area_m2) : null,
    highlighted: form.highlighted,
    contact_phone: form.contact_phone || null,
    property_type: form.property_type || null,
    for_sale: Boolean(form.for_sale),
    for_rent: Boolean(form.for_rent),
    region: form.region.trim() || null,
    commune: form.commune.trim() || null,
    street: form.street.trim() || null,
    street_number: form.street_number.trim() || null,
    region_slug: regionSlug || null,
    commune_slug: communeSlug || null,
    latitude: parsePropertyCoordinate(form.latitude),
    longitude: parsePropertyCoordinate(form.longitude),
  }
}
