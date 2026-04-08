import type { OperationSlug, PropertyTypeSlug } from "@/types/property-seo"

export const SEO_BASE_URL_ENV_KEYS = ["NEXT_PUBLIC_SEO_BASE_URL", "NEXT_PUBLIC_SITE_URL", "SITE_URL"] as const
export const SEO_BASE_URL_FALLBACK = "http://localhost:3000"
export const SEO_DEFAULT_OG_IMAGE = "/images/home/hero-property.webp"

export const PROPERTY_TYPE_SLUGS = ["terrenos", "casas", "locales-comerciales", "departamentos"] as const satisfies ReadonlyArray<PropertyTypeSlug>
export const OPERATION_SLUGS = ["venta", "arriendo"] as const satisfies ReadonlyArray<OperationSlug>

export const PROPERTY_TYPE_LABELS: Record<PropertyTypeSlug, string> = {
  terrenos: "Terrenos",
  casas: "Casas",
  "locales-comerciales": "Locales comerciales",
  departamentos: "Departamentos",
}

export const OPERATION_LABELS: Record<OperationSlug, string> = {
  venta: "Venta",
  arriendo: "Arriendo",
}

export const OPERATION_TO_DB_FIELD: Record<OperationSlug, "for_sale" | "for_rent"> = {
  venta: "for_sale",
  arriendo: "for_rent",
}

export function resolveSeoBaseUrl(): string {
  for (const envKey of SEO_BASE_URL_ENV_KEYS) {
    const rawValue = process.env[envKey]
    if (!rawValue) continue

    try {
      return new URL(rawValue).toString().replace(/\/$/, "")
    } catch {
      continue
    }
  }

  return SEO_BASE_URL_FALLBACK
}

export function resolveSeoBaseUrlAsUrl(): URL {
  return new URL(resolveSeoBaseUrl())
}
