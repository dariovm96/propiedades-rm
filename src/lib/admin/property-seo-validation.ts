import { normalizePropertySlug } from "@/lib/property-form"

type SeoFieldKey =
  | "property_type"
  | "operation"
  | "region"
  | "commune"
  | "street"
  | "street_number"
  | "region_slug"
  | "commune_slug"
  | "latitude"
  | "longitude"

export type PropertySeoValidationErrors = Partial<Record<SeoFieldKey, string>>

export type PropertySeoValidationResult = {
  ok: boolean
  errors: PropertySeoValidationErrors
}

type PropertySeoPayload = {
  property_type?: unknown
  for_sale?: unknown
  for_rent?: unknown
  region?: unknown
  commune?: unknown
  street?: unknown
  street_number?: unknown
  region_slug?: unknown
  commune_slug?: unknown
  latitude?: unknown
  longitude?: unknown
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isCanonicalSlug(value: string): boolean {
  return normalizePropertySlug(value) === value
}

export function validatePropertySeoPayload(payload: PropertySeoPayload): PropertySeoValidationResult {
  const errors: PropertySeoValidationErrors = {}

  const propertyType =
    typeof payload.property_type === "string" ? payload.property_type.trim() : ""

  if (!propertyType) {
    errors.property_type = "property_type is required"
  }

  if (!isBoolean(payload.for_sale) || !isBoolean(payload.for_rent)) {
    errors.operation = "for_sale and for_rent must be boolean"
  } else if (!payload.for_sale && !payload.for_rent) {
    errors.operation = "at least one operation must be enabled"
  }

  const regionSlug = typeof payload.region_slug === "string" ? payload.region_slug.trim() : ""
  const region = typeof payload.region === "string" ? payload.region.trim() : ""
  if (!region) {
    errors.region = "region is required"
  }

  const commune = typeof payload.commune === "string" ? payload.commune.trim() : ""
  if (!commune) {
    errors.commune = "commune is required"
  }

  const street = typeof payload.street === "string" ? payload.street.trim() : ""
  if (!street) {
    errors.street = "street is required"
  }

  const streetNumber = typeof payload.street_number === "string" ? payload.street_number.trim() : ""
  if (!streetNumber) {
    errors.street_number = "street_number is required"
  }

  if (!regionSlug) {
    errors.region_slug = "region_slug is required"
  } else if (!isCanonicalSlug(regionSlug)) {
    errors.region_slug = "region_slug must be canonical slug"
  }

  const communeSlug =
    typeof payload.commune_slug === "string" ? payload.commune_slug.trim() : ""
  if (!communeSlug) {
    errors.commune_slug = "commune_slug is required"
  } else if (!isCanonicalSlug(communeSlug)) {
    errors.commune_slug = "commune_slug must be canonical slug"
  }

  if (!isFiniteNumber(payload.latitude)) {
    errors.latitude = "latitude must be a valid number"
  } else if (Math.abs(payload.latitude) > 90) {
    errors.latitude = "latitude must be within -90 and 90"
  }

  if (!isFiniteNumber(payload.longitude)) {
    errors.longitude = "longitude must be a valid number"
  } else if (Math.abs(payload.longitude) > 180) {
    errors.longitude = "longitude must be within -180 and 180"
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  }
}
