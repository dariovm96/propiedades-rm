export const revalidate = 60 // cache property detail for one minute

import type { Metadata } from "next"
import { getPublicPropertyHighlightsByPropertyId, getSeoPropertyBySlug } from "@/lib/properties/public-repo"
import { getCanonicalPath } from "@/lib/seo/url"
import { toCanonicalRouteInput } from "@/lib/seo/routing"
import { OPERATION_LABELS } from "@/lib/seo/constants"
import { buildLegacyPropertyMetadata, buildPropertyMetadata } from "@/lib/seo/metadata"
import { notFound, permanentRedirect } from "next/navigation"
import { toPropertyDetailViewModel } from "@/lib/properties/property-detail-view-model"
import PropertyDetailVisual from "@/components/property-detail/PropertyDetailVisual"

type Props = {
    params: Promise<{
        slug: string
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const seoProperty = await getSeoPropertyBySlug(slug)

    if (!seoProperty) {
        return buildLegacyPropertyMetadata({ slug })
    }

    const canonicalRoute = toCanonicalRouteInput(seoProperty)

    if (canonicalRoute) {
        const { tipo, region_slug, commune_slug, slug: canonicalSlug } = canonicalRoute

        if (!region_slug || !commune_slug || !canonicalSlug) {
            return buildLegacyPropertyMetadata({
                slug,
                title: seoProperty.title,
                description: seoProperty.description,
                ogImage: resolveMetadataImage(seoProperty.images),
            })
        }

        return buildPropertyMetadata({
            tipo,
            region_slug,
            commune_slug,
            slug: canonicalSlug,
            title: seoProperty.title,
            operationLabel: seoProperty.for_sale ? OPERATION_LABELS.venta : seoProperty.for_rent ? OPERATION_LABELS.arriendo : undefined,
            region: seoProperty.region,
            commune: seoProperty.commune,
            description: seoProperty.description,
            ogImage: resolveMetadataImage(seoProperty.images),
        })
    }

    return buildLegacyPropertyMetadata({
        slug,
        title: seoProperty.title,
        description: seoProperty.description,
        ogImage: resolveMetadataImage(seoProperty.images),
    })
}

export default async function PropertyDetailPage({ params }: Props) {
    // ✅ Next 15: params es async
    const { slug } = await params

    const seoProperty = await getSeoPropertyBySlug(slug)
    const canonicalRoute = seoProperty ? toCanonicalRouteInput(seoProperty) : null

    if (canonicalRoute) {
        permanentRedirect(getCanonicalPath(canonicalRoute))
    }

    if (!seoProperty) {
        notFound()
    }

    const highlights = await getPublicPropertyHighlightsByPropertyId(seoProperty.id)
    const viewModel = toPropertyDetailViewModel({
        property: seoProperty,
        highlights,
    })

     /* ==============================
         3. Render
     ============================== */
    return <PropertyDetailVisual model={viewModel} />
}
