export type Property = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number | null
  currency: string | null
  area_m2: number | null
  location_text: string | null
  status: "available" | "sold" | "rented"
  highlighted: boolean
  contact_phone: string | null
  images: string[]
}
