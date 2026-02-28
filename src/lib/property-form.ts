import type { PropertyStatus } from "@/lib/constants"

export type PropertyFormValues = {
  title: string
  description: string
  location_text: string
  price: string
  status: PropertyStatus
  area_m2: string
  highlighted: boolean
  contact_phone: string
}

export function toPropertyPayload(form: PropertyFormValues) {
  return {
    title: form.title,
    description: form.description || null,
    location_text: form.location_text || null,
    price: form.price ? Number(form.price) : null,
    status: form.status,
    area_m2: form.area_m2 ? Number(form.area_m2) : null,
    highlighted: form.highlighted,
    contact_phone: form.contact_phone || null,
  }
}