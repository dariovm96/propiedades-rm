import type { PropertyStatus } from "@/lib/constants"

export type Property = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number | null
  area_m2: number | null
  location_text: string | null
  property_type?: string | null
  for_sale?: boolean | null
  for_rent?: boolean | null
  region?: string | null
  region_slug?: string | null
  commune?: string | null
  commune_slug?: string | null
  street?: string | null
  street_number?: string | null
  latitude?: number | null
  longitude?: number | null
  status: PropertyStatus
  highlighted: boolean
  contact_phone: string | null
  images: string[]
}

export type PropertyFormPayload = {
  title: string
  description: string | null
  location_text: string | null
  price: number | null
  status: PropertyStatus
  area_m2: number | null
  highlighted: boolean
  contact_phone: string | null
  property_type: string | null
  for_sale: boolean | null
  for_rent: boolean | null
  region: string | null
  commune: string | null
  street: string | null
  street_number: string | null
  region_slug: string | null
  commune_slug: string | null
  latitude: number | null
  longitude: number | null
}

type PropertySeoFormPayload = {
  property_type: string | null
  for_sale: boolean | null
  for_rent: boolean | null
  region_slug: string | null
  commune_slug: string | null
  latitude: number | null
  longitude: number | null
}

type PropertyFormBasePayload = Omit<PropertyFormPayload, keyof PropertySeoFormPayload>

export type AdminPropertyFormPayload = PropertyFormBasePayload & PropertySeoFormPayload

export type PropertyInsertPayload = AdminPropertyFormPayload & Pick<Property, "slug" | "images">

export type PropertyUpdatePayload = AdminPropertyFormPayload & Pick<Property, "images">
