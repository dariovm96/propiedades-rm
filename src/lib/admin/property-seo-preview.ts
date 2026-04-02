import { OPERATION_LABELS } from "@/lib/seo/constants"
import { buildPropertyMetadata } from "@/lib/seo/metadata"
import { toCanonicalRouteInput } from "@/lib/seo/routing"
import { getCanonicalPath, getCanonicalUrl } from "@/lib/seo/url"
import {
  deriveLocationSlugs,
  hasValidPropertyCoordinateRange,
  normalizePropertySlug,
  parsePropertyCoordinate,
  PropertyFormValues,
} from "@/lib/property-form"

type PropertySeoPreviewWarnings = {
  fallbackRisk: string
}

export type PropertySeoPreviewResult = {
  statusLabel: string
  summary: string
  addressLine: string | null
  canonical: string | null
  canonicalTag: string | null
  title: string | null
  description: string | null
  warning: string | null
  complete: boolean
}

const PREVIEW_WARNINGS: PropertySeoPreviewWarnings = {
  fallbackRisk: "Faltan campos SEO mínimos: el detalle público puede caer en legacy fallback.",
}

type SeoPreviewDraftInput = {
  slug?: string | null
  title?: string | null
  description?: string | null
  property_type?: string | null
  for_sale?: boolean | null
  for_rent?: boolean | null
  region_slug?: string | null
  commune_slug?: string | null
  region?: string | null
  commune?: string | null
  street?: string | null
  street_number?: string | null
  latitude?: number | null
  longitude?: number | null
}

function buildAddressLine(input: SeoPreviewDraftInput): string | null {
  const street = input.street?.trim() ?? ""
  const streetNumber = input.street_number?.trim() ?? ""
  const commune = input.commune?.trim() ?? ""
  const region = input.region?.trim() ?? ""

  const streetLine = [street, streetNumber].filter(Boolean).join(" ").trim()
  const locationLine = [commune, region].filter(Boolean).join(", ").trim()
  const fullAddress = [streetLine, locationLine].filter(Boolean).join(" · ").trim()

  return fullAddress || null
}

function getOperationLabel(forSale?: boolean | null, forRent?: boolean | null): string | undefined {
  if (forSale) {
    return OPERATION_LABELS.venta
  }

  if (forRent) {
    return OPERATION_LABELS.arriendo
  }

  return undefined
}

export function resolvePropertySeoPreview(input: SeoPreviewDraftInput): PropertySeoPreviewResult {
  const normalizedSlug = normalizePropertySlug(input.slug ?? "")
  const normalizedRegionSlug = normalizePropertySlug(input.region_slug ?? "")
  const normalizedCommuneSlug = normalizePropertySlug(input.commune_slug ?? "")
  const hasOperation = Boolean(input.for_sale) || Boolean(input.for_rent)
  const hasValidCoordinates = hasValidPropertyCoordinateRange(input.latitude ?? null, input.longitude ?? null)

  const canonicalRoute =
    normalizedSlug && hasOperation && hasValidCoordinates
      ? toCanonicalRouteInput({
          property_type: input.property_type ?? null,
          region_slug: normalizedRegionSlug || null,
          commune_slug: normalizedCommuneSlug || null,
          slug: normalizedSlug,
        })
      : null

  if (!canonicalRoute) {
    return {
      statusLabel: "Faltan datos",
      summary: "Completá dirección y datos mínimos para generar la URL pública.",
      addressLine: buildAddressLine(input),
      canonical: null,
      canonicalTag: null,
      title: null,
      description: null,
      warning: PREVIEW_WARNINGS.fallbackRisk,
      complete: false,
    }
  }

  const { tipo, region_slug, commune_slug, slug } = canonicalRoute

  if (!region_slug || !commune_slug || !slug) {
    return {
      statusLabel: "Faltan datos",
      summary: "Completá dirección y datos mínimos para generar la URL pública.",
      addressLine: buildAddressLine(input),
      canonical: null,
      canonicalTag: null,
      title: null,
      description: null,
      warning: PREVIEW_WARNINGS.fallbackRisk,
      complete: false,
    }
  }

  const metadata = buildPropertyMetadata({
    tipo,
    region_slug,
    commune_slug,
    slug,
    title: input.title?.trim() || "Propiedad",
    operationLabel: getOperationLabel(input.for_sale, input.for_rent),
    region: input.region?.trim() || null,
    commune: input.commune?.trim() || null,
    description: input.description?.trim() || null,
  })

  return {
    statusLabel: "URL lista",
    summary: "La propiedad tiene datos suficientes para mostrar URL canónica.",
    addressLine: buildAddressLine(input),
    canonical: getCanonicalPath({ tipo, region_slug, commune_slug, slug }),
    canonicalTag: `<link rel="canonical" href="${getCanonicalUrl({ tipo, region_slug, commune_slug, slug })}" />`,
    title: typeof metadata.title === "string" ? metadata.title : null,
    description: typeof metadata.description === "string" ? metadata.description : null,
    warning: null,
    complete: true,
  }
}

export function resolvePropertySeoPreviewFromForm(form: PropertyFormValues): PropertySeoPreviewResult {
  const derivedLocation = deriveLocationSlugs({
    regionText: form.region,
    communeText: form.commune,
  })

  return resolvePropertySeoPreview({
    slug: form.title,
    title: form.title,
    description: form.description,
    property_type: form.property_type,
    for_sale: form.for_sale,
    for_rent: form.for_rent,
    region_slug: derivedLocation.region_slug || form.region_slug,
    commune_slug: derivedLocation.commune_slug || form.commune_slug,
    region: form.region,
    commune: form.commune,
    street: form.street,
    street_number: form.street_number,
    latitude: parsePropertyCoordinate(form.latitude),
    longitude: parsePropertyCoordinate(form.longitude),
  })
}
