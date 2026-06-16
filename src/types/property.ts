import type { PropertyStatus } from "@/lib/constants"

export type Property = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number | null
  area_m2: number | null
  location_text: string | null
  status: PropertyStatus
  highlighted: boolean
  contact_phone: string | null
  lat: number | null
  lng: number | null
  images: string[]
}

export type PropertyFormPayload = Pick<
  Property,
  "title" | "description" | "location_text" | "price" | "status" | "area_m2" | "highlighted" | "contact_phone" | "lat" | "lng"
>

export type PropertyInsertPayload = PropertyFormPayload & Pick<Property, "slug" | "images">

export type PropertyUpdatePayload = PropertyFormPayload & Pick<Property, "images">
