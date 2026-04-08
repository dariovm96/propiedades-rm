import { OPERATION_SLUGS, PROPERTY_TYPE_SLUGS } from "@/lib/seo/constants"
import type { OperationSlug, PropertySeoDetail, PropertySeoRouteInput, PropertyTypeSlug } from "@/types/property-seo"

const PROPERTY_TYPE_ALIASES: Record<string, PropertyTypeSlug> = {
  terreno: "terrenos",
  terrenos: "terrenos",
  casa: "casas",
  casas: "casas",
  "local-comercial": "locales-comerciales",
  "local-comerciales": "locales-comerciales",
  "local comercial": "locales-comerciales",
  "locales comerciales": "locales-comerciales",
  "locales-comerciales": "locales-comerciales",
  departamento: "departamentos",
  departamentos: "departamentos",
}

function normalizePropertyTypeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
}

export function isPropertyTypeSlug(value: string): value is PropertyTypeSlug {
  return PROPERTY_TYPE_SLUGS.includes(value as PropertyTypeSlug)
}

export function isOperationSlug(value: string): value is OperationSlug {
  return OPERATION_SLUGS.includes(value as OperationSlug)
}

export function toPropertyTypeSlug(value: string | null | undefined): PropertyTypeSlug | null {
  if (!value) return null

  const normalized = normalizePropertyTypeKey(value)
  const fromAlias = PROPERTY_TYPE_ALIASES[normalized]

  if (fromAlias) {
    return fromAlias
  }

  if (isPropertyTypeSlug(normalized)) {
    return normalized
  }

  return null
}

export function toCanonicalRouteInput(property: Pick<PropertySeoDetail, "property_type" | "region_slug" | "commune_slug" | "slug">):
  | PropertySeoRouteInput
  | null {
  const propertyTypeSlug = toPropertyTypeSlug(property.property_type)

  if (!propertyTypeSlug || !property.region_slug || !property.commune_slug || !property.slug) {
    return null
  }

  return {
    tipo: propertyTypeSlug,
    region_slug: property.region_slug,
    commune_slug: property.commune_slug,
    slug: property.slug,
  }
}
