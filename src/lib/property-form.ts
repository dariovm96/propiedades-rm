import type { PropertyStatus } from "@/lib/constants"
import { PropertyFormPayload } from "@/types/property"

export type PropertyFormValues = {
  title: string
  description: string
  location_text: string
  municipality: string
  region_name: string
  sector_reference: string
  street_address: string
  price: string
  status: PropertyStatus
  area_m2: string
  highlighted: boolean
  contact_phone: string
  lat: string
  lng: string
}

export function toPropertyPayload(form: PropertyFormValues): PropertyFormPayload {
  return {
    title: form.title,
    description: form.description || null,
    location_text: form.location_text || null,
    municipality: form.municipality?.trim() || null,
    region_name: form.region_name?.trim() || null,
    sector_reference: form.sector_reference?.trim() || null,
    street_address: form.street_address?.trim() || null,
    price: form.price ? Number(form.price) : null,
    status: form.status,
    area_m2: form.area_m2 ? Number(form.area_m2) : null,
    highlighted: form.highlighted,
    contact_phone: form.contact_phone || null,
    lat: form.lat && !isNaN(Number(form.lat)) ? Number(form.lat) : null,
    lng: form.lng && !isNaN(Number(form.lng)) ? Number(form.lng) : null,
  }
}