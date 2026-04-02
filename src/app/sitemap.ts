import type { MetadataRoute } from "next"
import { getSeoSitemapProperties } from "@/lib/properties/public-repo"
import { OPERATION_SLUGS, PROPERTY_TYPE_SLUGS, resolveSeoBaseUrl } from "@/lib/seo/constants"
import { toPropertyTypeSlug } from "@/lib/seo/routing"
import { getCanonicalPath, getListingPath } from "@/lib/seo/url"

function toAbsoluteUrl(path: string): string {
  const baseUrl = resolveSeoBaseUrl()
  return new URL(path, `${baseUrl}/`).toString()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: toAbsoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: toAbsoluteUrl("/propiedades"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
  ]

  const listingRoutes: MetadataRoute.Sitemap = []

  for (const tipo of PROPERTY_TYPE_SLUGS) {
    for (const operacion of OPERATION_SLUGS) {
      listingRoutes.push({
        url: toAbsoluteUrl(
          getListingPath({
            tipo,
            operacion,
          }),
        ),
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      })
    }
  }

  const sitemapProperties = await getSeoSitemapProperties()
  const canonicalRoutesUnfiltered = sitemapProperties.map((item) => {
      const tipo = toPropertyTypeSlug(item.property_type)

      if (!tipo || !item.slug || !item.region_slug || !item.commune_slug) {
        return null
      }

      return {
        url: toAbsoluteUrl(
          getCanonicalPath({
            tipo,
            region_slug: item.region_slug,
            commune_slug: item.commune_slug,
            slug: item.slug,
          }),
        ),
        lastModified: item.updated_at || item.created_at || now.toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }
    })

  const canonicalRoutes: MetadataRoute.Sitemap = canonicalRoutesUnfiltered.filter(
    (entry): entry is NonNullable<(typeof canonicalRoutesUnfiltered)[number]> => entry !== null,
  )

  return [...staticRoutes, ...listingRoutes, ...canonicalRoutes]
}
