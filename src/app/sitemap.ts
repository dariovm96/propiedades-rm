import { MetadataRoute } from "next"
import { supabase } from "@/lib/supabase"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"

  const { data: properties } = await supabase
    .from("properties")
    .select("slug, status, created_at")
    .eq("status", "available")

  const propertyUrls = (properties || []).map((p) => ({
    url: `${baseUrl}/propiedades/${p.slug}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/propiedades`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...propertyUrls,
  ]
}
