import type { MetadataRoute } from "next"
import { resolveSeoBaseUrl } from "@/lib/seo/constants"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveSeoBaseUrl()
  const sitemapUrl = new URL("/sitemap.xml", `${baseUrl}/`).toString()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*"],
      },
    ],
    sitemap: sitemapUrl,
  }
}
