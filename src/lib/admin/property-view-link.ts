import { toCanonicalRouteInput } from "@/lib/seo/routing"
import { getCanonicalPath, getLegacyPropertyPath } from "@/lib/seo/url"
import type { Property } from "@/types/property"

export type PropertyViewState = "canonical_ok" | "legacy_fallback"

export type PropertyViewLinkResolution = {
  href: string | null
  state: PropertyViewState
  badge: "Canónica OK" | "Legacy fallback"
}

function hasValidCoordinates(latitude?: number | null, longitude?: number | null): boolean {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return false
  }

  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
}

export function resolveViewLinkAndState(property: Pick<Property, "slug" | "property_type" | "for_sale" | "for_rent" | "region_slug" | "commune_slug" | "latitude" | "longitude">): PropertyViewLinkResolution {
  if (!property.slug) {
    return {
      href: null,
      state: "legacy_fallback",
      badge: "Legacy fallback",
    }
  }

  const hasOperation = Boolean(property.for_sale) || Boolean(property.for_rent)

  const canonicalRoute =
    hasOperation && hasValidCoordinates(property.latitude, property.longitude)
      ? toCanonicalRouteInput({
          property_type: property.property_type ?? null,
          region_slug: property.region_slug ?? null,
          commune_slug: property.commune_slug ?? null,
          slug: property.slug,
        })
      : null

  if (canonicalRoute) {
    return {
      href: getCanonicalPath(canonicalRoute),
      state: "canonical_ok",
      badge: "Canónica OK",
    }
  }

  return {
    href: getLegacyPropertyPath(property.slug),
    state: "legacy_fallback",
    badge: "Legacy fallback",
  }
}
