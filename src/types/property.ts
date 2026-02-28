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
  images: string[]
}
