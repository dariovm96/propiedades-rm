import type { PropertyStatus } from "@/lib/constants"

export type PropertyTypeSlug = "terrenos" | "casas" | "locales-comerciales" | "departamentos"
export type OperationSlug = "venta" | "arriendo"

export type PropertySeoRecord = {
  id: string
  slug: string
  title: string
  description: string | null
  price: number | null
  area_m2: number | null
  status: PropertyStatus
  images: string[] | null
  property_type: string | null
  for_sale: boolean | null
  for_rent: boolean | null
  region: string | null
  region_slug: string | null
  commune: string | null
  commune_slug: string | null
  latitude: number | null
  longitude: number | null
  highlighted: boolean | null
  location_text: string | null
  contact_phone: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type PropertySeoListItem = Pick<
  PropertySeoRecord,
  | "id"
  | "slug"
  | "title"
  | "price"
  | "area_m2"
  | "status"
  | "images"
  | "property_type"
  | "for_sale"
  | "for_rent"
  | "region"
  | "region_slug"
  | "commune"
  | "commune_slug"
  | "highlighted"
  | "location_text"
>

export type PropertySeoDetail = PropertySeoRecord

export type PropertySeoSitemapItem = Pick<
  PropertySeoRecord,
  "slug" | "property_type" | "region_slug" | "commune_slug" | "updated_at" | "created_at" | "for_sale" | "for_rent"
>

export type PropertySeoRouteInput = {
  tipo: string
  operacion?: string
  region_slug?: string | null
  commune_slug?: string | null
  slug?: string
}
