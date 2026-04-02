import { PROPERTY_STATUS_LABELS, type PropertyStatus } from "@/lib/constants"
import { SEO_DEFAULT_OG_IMAGE, resolveSeoBaseUrl } from "@/lib/seo/constants"
import { getCanonicalUrl } from "@/lib/seo/url"
import type { PropertySeoDetail, PropertySeoRouteInput } from "@/types/property-seo"

export type JsonLdObject = Record<string, unknown>

const ORGANIZATION_NAME = "Propiedades RM"
const ORGANIZATION_LOGO_PATH = SEO_DEFAULT_OG_IMAGE

function getStatusAvailability(status: PropertyStatus): string {
  switch (status) {
    case "sold":
      return "https://schema.org/SoldOut"
    case "rented":
      return "https://schema.org/LimitedAvailability"
    case "available":
    default:
      return "https://schema.org/InStock"
  }
}

function getStatusDescription(status: PropertyStatus): string {
  return `Estado: ${PROPERTY_STATUS_LABELS[status]}`
}

export function buildOrganizationJsonLd(): JsonLdObject {
  const baseUrl = resolveSeoBaseUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}#organization`,
    name: ORGANIZATION_NAME,
    url: baseUrl,
    logo: new URL(ORGANIZATION_LOGO_PATH, `${baseUrl}/`).toString(),
  }
}

export function buildPropertyJsonLd(input: {
  route: Required<Pick<PropertySeoRouteInput, "tipo" | "region_slug" | "commune_slug" | "slug">>
  property: Pick<
    PropertySeoDetail,
    "title" | "description" | "price" | "images" | "area_m2" | "status" | "region" | "commune" | "created_at"
  >
}): JsonLdObject {
  const canonicalUrl = getCanonicalUrl(input.route)
  const imageList = (input.property.images ?? []).filter((image) => image && image.trim().length > 0)

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${canonicalUrl}#listing`,
    url: canonicalUrl,
    name: input.property.title,
    description:
      input.property.description?.trim() ||
      `${input.property.title}. ${getStatusDescription(input.property.status)} en ${input.property.commune ?? "comuna por confirmar"}.`,
    image: imageList,
    datePosted: input.property.created_at ?? undefined,
    offers: {
      "@type": "Offer",
      price: typeof input.property.price === "number" ? input.property.price : undefined,
      priceCurrency: "CLP",
      availability: getStatusAvailability(input.property.status),
      itemCondition: "https://schema.org/UsedCondition",
      url: canonicalUrl,
    },
    itemOffered: {
      "@type": "House",
      name: input.property.title,
      floorSize: typeof input.property.area_m2 === "number" ? { "@type": "QuantitativeValue", value: input.property.area_m2, unitCode: "MTK" } : undefined,
      address: {
        "@type": "PostalAddress",
        addressCountry: "CL",
        addressRegion: input.property.region ?? undefined,
        addressLocality: input.property.commune ?? undefined,
      },
    },
    seller: {
      "@id": `${resolveSeoBaseUrl()}#organization`,
    },
  }
}

export function toJsonLdScriptContent(input: JsonLdObject): string {
  return JSON.stringify(input)
}
