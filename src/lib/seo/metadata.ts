import type { Metadata } from "next"
import type { OperationSlug, PropertyTypeSlug } from "@/types/property-seo"
import {
  OPERATION_LABELS,
  PROPERTY_TYPE_LABELS,
  SEO_DEFAULT_OG_IMAGE,
  resolveSeoBaseUrl,
  resolveSeoBaseUrlAsUrl,
} from "@/lib/seo/constants"
import { getCanonicalPath, getListingPath } from "@/lib/seo/url"

type BaseMetadataInput = {
  title: string
  description: string
  canonicalPath: string
  ogImage?: string
}

function getAbsoluteUrl(path: string): string {
  const base = resolveSeoBaseUrl()
  return new URL(path, `${base}/`).toString()
}

function toAbsoluteImageUrl(imagePathOrUrl?: string | null): string {
  if (!imagePathOrUrl) {
    return getAbsoluteUrl(SEO_DEFAULT_OG_IMAGE)
  }

  try {
    return new URL(imagePathOrUrl).toString()
  } catch {
    return getAbsoluteUrl(imagePathOrUrl)
  }
}

export function buildBaseMetadata(input: BaseMetadataInput): Metadata {
  const canonical = getAbsoluteUrl(input.canonicalPath)
  const ogImageUrl = toAbsoluteImageUrl(input.ogImage)

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      images: [ogImageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export function buildSeoLayoutMetadata(): Metadata {
  const base = resolveSeoBaseUrlAsUrl()
  const title = "Propiedades RM"
  const description = "Compra y arriendo directo de propiedades sin intermediarios"

  return {
    metadataBase: base,
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "Propiedades RM",
      title,
      description,
      url: base.toString(),
      images: [getAbsoluteUrl(SEO_DEFAULT_OG_IMAGE)],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getAbsoluteUrl(SEO_DEFAULT_OG_IMAGE)],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export function buildLegacyPropertyMetadata(input: {
  slug: string
  title?: string | null
  description?: string | null
  ogImage?: string | null
}): Metadata {
  const cleanTitle = input.title?.trim()
  const title = cleanTitle ? `${cleanTitle} | Propiedades RM` : "Propiedad | Propiedades RM"
  const description =
    input.description?.trim() || "Conocé esta propiedad en Propiedades RM y contactá directo con el propietario."

  return buildBaseMetadata({
    title,
    description,
    canonicalPath: `/propiedades/${input.slug}`,
    ogImage: input.ogImage ?? undefined,
  })
}

export function buildListingMetadata(input: {
  tipo: PropertyTypeSlug | string
  operacion: OperationSlug | string
  region?: string | null
  commune?: string | null
  region_slug?: string | null
  commune_slug?: string | null
}): Metadata {
  const tipoLabel = PROPERTY_TYPE_LABELS[input.tipo as PropertyTypeSlug] ?? input.tipo
  const operacionLabel = OPERATION_LABELS[input.operacion as OperationSlug] ?? input.operacion
  const locationLabel = input.commune ?? input.region
  const locationSuffix = locationLabel ? ` en ${locationLabel}` : ""

  const title = `${tipoLabel} en ${operacionLabel}${locationSuffix} | Propiedades RM`
  const description = `Revisa ${tipoLabel.toLowerCase()} disponibles para ${operacionLabel.toLowerCase()}${locationSuffix.toLowerCase()} con contacto directo y sin intermediarios.`
  const canonicalPath = getListingPath({
    tipo: input.tipo,
    operacion: input.operacion,
    region_slug: input.region_slug,
    commune_slug: input.commune_slug,
  })

  return buildBaseMetadata({
    title,
    description,
    canonicalPath,
  })
}

export function buildPropertyMetadata(input: {
  tipo: PropertyTypeSlug | string
  region_slug: string
  commune_slug: string
  slug: string
  title: string
  operationLabel?: string | null
  region?: string | null
  commune?: string | null
  description?: string | null
  ogImage?: string | null
}): Metadata {
  const locationText = [input.commune, input.region].filter(Boolean).join(", ")
  const operationPrefix = input.operationLabel ? `${input.operationLabel} · ` : ""
  const metadataTitle = `${operationPrefix}${input.title}${locationText ? ` - ${locationText}` : ""} | Propiedades RM`
  const metadataDescription =
    input.description?.trim() ||
    `${input.title}${locationText ? ` ubicada en ${locationText}` : ""}. Revisa detalles y contacta directo con el propietario.`

  return buildBaseMetadata({
    title: metadataTitle,
    description: metadataDescription,
    canonicalPath: getCanonicalPath({
      tipo: input.tipo,
      region_slug: input.region_slug,
      commune_slug: input.commune_slug,
      slug: input.slug,
    }),
    ogImage: input.ogImage ?? undefined,
  })
}
