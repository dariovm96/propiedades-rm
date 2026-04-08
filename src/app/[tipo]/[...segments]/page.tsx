import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import PropertyGrid from "@/components/PropertyGrid"
import { OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/seo/constants"
import {
  getPublicPropertyHighlightsByPropertyId,
  getSeoPropertiesByListing,
  getSeoPropertyBySlug,
} from "@/lib/properties/public-repo"
import { isOperationSlug, isPropertyTypeSlug, toPropertyTypeSlug } from "@/lib/seo/routing"
import { buildListingMetadata, buildPropertyMetadata } from "@/lib/seo/metadata"
import { buildPropertyJsonLd, safeJsonLdScriptContent } from "@/lib/seo/jsonld"
import type { Property } from "@/types/property"
import { toPropertyDetailViewModel } from "@/lib/properties/property-detail-view-model"
import PropertyDetailVisual from "@/components/property-detail/PropertyDetailVisual"

type Props = {
  params: Promise<{
    tipo: string
    segments: string[]
  }>
}

function resolveMetadataImage(images?: string[] | null): string | undefined {
  const firstImage = images?.find((image) => typeof image === "string" && image.trim().length > 0)

  if (!firstImage) {
    return undefined
  }

  if (firstImage.startsWith("http://") || firstImage.startsWith("https://") || firstImage.startsWith("/")) {
    return firstImage
  }

  return undefined
}

function getListingDescription(input: { operationLabel: string; typeLabel: string; region?: string | null; commune?: string | null }) {
  if (input.commune && input.region) {
    return `${input.typeLabel} disponibles para ${input.operationLabel.toLowerCase()} en ${input.commune}, ${input.region}.`
  }

  if (input.region) {
    return `${input.typeLabel} disponibles para ${input.operationLabel.toLowerCase()} en ${input.region}.`
  }

  return `${input.typeLabel} disponibles para ${input.operationLabel.toLowerCase()} en distintas zonas de la Región Metropolitana.`
}

async function renderListing(input: {
  tipo: string
  operacion: string
  region_slug?: string
  commune_slug?: string
}) {
  if (!isPropertyTypeSlug(input.tipo) || !isOperationSlug(input.operacion)) {
    notFound()
  }

  const properties = await getSeoPropertiesByListing({
    tipo: input.tipo,
    operacion: input.operacion,
    region_slug: input.region_slug,
    commune_slug: input.commune_slug,
  })

  const typeLabel = PROPERTY_TYPE_LABELS[input.tipo]
  const operationLabel = OPERATION_LABELS[input.operacion]
  const firstProperty = properties[0]
  const regionLabel = firstProperty?.region ?? null
  const communeLabel = firstProperty?.commune ?? null
  const gridProperties: Array<Property & { highlights?: string[] }> = properties.map((property) => ({
    ...property,
    description: null,
    contact_phone: null,
    highlighted: Boolean(property.highlighted),
    images: property.images ?? [],
  }))

  return (
    <section className="space-y-8 sm:space-y-10">
      <div className="space-y-4">
        <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-content-secondary sm:text-sm">
          <Link href="/" className="hover:text-content-primary transition">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/propiedades" className="hover:text-content-primary transition">
            Propiedades
          </Link>
          <span>/</span>
          <span className="font-medium text-content-primary">{typeLabel}</span>
          <span>/</span>
          <span className="font-medium text-content-primary">{operationLabel}</span>
          {regionLabel ? (
            <>
              <span>/</span>
              <span className="font-medium text-content-primary">{regionLabel}</span>
            </>
          ) : null}
          {communeLabel ? (
            <>
              <span>/</span>
              <span className="font-medium text-content-primary">{communeLabel}</span>
            </>
          ) : null}
        </nav>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-content-primary sm:text-4xl">
            {typeLabel} en {operationLabel}
            {communeLabel ? ` · ${communeLabel}` : regionLabel ? ` · ${regionLabel}` : ""}
          </h1>
          <p className="max-w-2xl text-sm text-content-secondary sm:text-base">
            {getListingDescription({
              operationLabel,
              typeLabel,
              region: regionLabel,
              commune: communeLabel,
            })}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-0 px-4 py-2 text-sm font-medium text-content-secondary">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          {properties.length} {properties.length === 1 ? "propiedad publicada" : "propiedades publicadas"}
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl border border-border-subtle border-dashed bg-surface-0 p-8 text-center sm:p-10">
          <p className="text-sm text-content-secondary sm:text-base">
            No encontramos propiedades para esta combinación. Probá otra comuna u operación.
          </p>
        </div>
      ) : (
        <PropertyGrid properties={gridProperties} />
      )}
    </section>
  )
}

async function renderCanonicalDetail(input: {
  tipo: string
  region_slug: string
  commune_slug: string
  slug: string
}) {
  if (!isPropertyTypeSlug(input.tipo)) {
    notFound()
  }

  const property = await getSeoPropertyBySlug(input.slug)

  if (!property) {
    notFound()
  }

  const canonicalPropertyType = toPropertyTypeSlug(property.property_type)

  if (
    canonicalPropertyType !== input.tipo ||
    property.region_slug !== input.region_slug ||
    property.commune_slug !== input.commune_slug
  ) {
    notFound()
  }

  const propertyJsonLd = safeJsonLdScriptContent(
    buildPropertyJsonLd({
      route: {
        tipo: input.tipo,
        region_slug: input.region_slug,
        commune_slug: input.commune_slug,
        slug: input.slug,
      },
      property,
    }),
  )

  const highlights = await getPublicPropertyHighlightsByPropertyId(property.id)
  const viewModel = toPropertyDetailViewModel({
    property,
    highlights,
  })

  return (
    <>
      {propertyJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: propertyJsonLd }} /> : null}
      <PropertyDetailVisual model={viewModel} />
    </>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo, segments } = await params

  if (!segments || segments.length === 0 || segments.length > 3) {
    return {}
  }

  if (!isPropertyTypeSlug(tipo)) {
    return {}
  }

  if (segments.length === 1 || segments.length === 2 || isOperationSlug(segments[0])) {
    const operacion = segments[0]
    if (!isOperationSlug(operacion)) {
      return {}
    }

    const region_slug = segments.length >= 2 ? segments[1] : undefined
    const commune_slug = segments.length === 3 ? segments[2] : undefined
    const properties = await getSeoPropertiesByListing({ tipo, operacion, region_slug, commune_slug, limit: 1 })
    const firstProperty = properties[0]

    return buildListingMetadata({
      tipo,
      operacion,
      region_slug,
      commune_slug,
      region: firstProperty?.region,
      commune: firstProperty?.commune,
    })
  }

  const [region_slug, commune_slug, slug] = segments
  const property = await getSeoPropertyBySlug(slug)

  if (!property) {
    return {}
  }

  const canonicalPropertyType = toPropertyTypeSlug(property.property_type)

  if (
    canonicalPropertyType !== tipo ||
    property.region_slug !== region_slug ||
    property.commune_slug !== commune_slug
  ) {
    return {}
  }

  return buildPropertyMetadata({
    tipo,
    region_slug,
    commune_slug,
    slug,
    title: property.title,
    operationLabel: property.for_sale ? OPERATION_LABELS.venta : property.for_rent ? OPERATION_LABELS.arriendo : undefined,
    region: property.region,
    commune: property.commune,
    description: property.description,
    ogImage: resolveMetadataImage(property.images),
  })
}

export default async function SeoPublicRoutesPage({ params }: Props) {
  const { tipo, segments } = await params

  if (!segments || segments.length === 0 || segments.length > 3) {
    notFound()
  }

  if (segments.length === 1) {
    return renderListing({ tipo, operacion: segments[0] })
  }

  if (segments.length === 2) {
    return renderListing({ tipo, operacion: segments[0], region_slug: segments[1] })
  }

  const [segmentA, segmentB, segmentC] = segments

  if (isOperationSlug(segmentA)) {
    return renderListing({
      tipo,
      operacion: segmentA,
      region_slug: segmentB,
      commune_slug: segmentC,
    })
  }

  return renderCanonicalDetail({
    tipo,
    region_slug: segmentA,
    commune_slug: segmentB,
    slug: segmentC,
  })
}
