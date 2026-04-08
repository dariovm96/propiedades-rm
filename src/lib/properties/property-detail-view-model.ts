import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/config/contact"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import type { PropertyStatus } from "@/lib/constants"
import type { PropertySeoDetail } from "@/types/property-seo"
import { PROPERTY_HIGHLIGHT_TEXT_COLUMNS, type PropertyHighlight } from "@/types/property-highlight"

type PropertyDetailSource = Pick<
  PropertySeoDetail,
  | "title"
  | "description"
  | "location_text"
  | "price"
  | "area_m2"
  | "status"
  | "images"
  | "contact_phone"
  | "latitude"
  | "longitude"
>

type PropertyDetailImageResolver = (imagePath: string) => string

export type PropertyDetailViewModel = {
  title: string
  description: string | null
  locationText: string
  formattedPrice: string
  areaLabel: string
  status: PropertyStatus
  imageUrls: string[]
  highlights: string[]
  contact: {
    phoneWithPrefix: string
    phoneDisplay: string
    whatsappPhone: string
  }
  map: {
    latitude?: number | null
    longitude?: number | null
  }
}

function toPublicImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://") || imagePath.startsWith("/")) {
    return imagePath
  }

  return getPublicImageUrl(imagePath)
}

function getTextFromUnknown(value: unknown): string {
  if (typeof value === "string") {
    return value.trim()
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return ""
  }

  const record = value as Record<string, unknown>
  const candidates = [record.text, ...PROPERTY_HIGHLIGHT_TEXT_COLUMNS.map((column) => record[column])]

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }

  return ""
}

function extractHighlightText(item: PropertyHighlight): string {
  const candidates: unknown[] = [item.highlight, item.text, item.title, item.label, item.name, item.value, item.description]

  for (const candidate of candidates) {
    const text = getTextFromUnknown(candidate)
    if (text.length > 0) {
      return text
    }
  }

  return ""
}

export function toPropertyDetailViewModel(
  input: {
    property: PropertyDetailSource
    highlights: PropertyHighlight[]
  },
  options: {
    resolveImageUrl?: PropertyDetailImageResolver
  } = {},
): PropertyDetailViewModel {
  const imageResolver = options.resolveImageUrl ?? toPublicImageUrl
  const imageUrls =
    input.property.images
      ?.filter((path): path is string => typeof path === "string" && path.trim().length > 0)
      .map((path) => imageResolver(path)) ?? []

  const contactPhone = input.property.contact_phone || CONTACT_PHONE
  const normalizedPhone = contactPhone.replace(/\s+/g, "")
  const phoneWithPrefix = normalizedPhone.startsWith("+") ? normalizedPhone : `+${normalizedPhone}`
  const whatsappPhone = normalizedPhone.replace(/^\+/, "")
  const phoneDisplay = contactPhone === CONTACT_PHONE ? CONTACT_PHONE_DISPLAY : phoneWithPrefix

  return {
    title: input.property.title,
    description: input.property.description,
    locationText: input.property.location_text || "Ubicacion por confirmar",
    formattedPrice: input.property.price ? `$${input.property.price.toLocaleString()}` : "Precio a consultar",
    areaLabel: input.property.area_m2 ? `${input.property.area_m2} m²` : "Superficie por confirmar",
    status: input.property.status,
    imageUrls,
    highlights: input.highlights.map(extractHighlightText).filter((text): text is string => text.length > 0),
    contact: {
      phoneWithPrefix,
      phoneDisplay,
      whatsappPhone,
    },
    map: {
      latitude: input.property.latitude,
      longitude: input.property.longitude,
    },
  }
}
