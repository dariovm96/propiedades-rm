export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: "property-images",
}

export const IMAGE_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const IMAGE_MAX_SIZE_MB = 5
export const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024

export const PROPERTY_STATUS_OPTIONS = ["available", "sold", "rented"] as const
export type PropertyStatus = (typeof PROPERTY_STATUS_OPTIONS)[number]

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Disponible",
  sold: "Vendida",
  rented: "Arrendada",
}

export const PROPERTY_STATUS_BADGE_CLASSES: Record<PropertyStatus, string> = {
  available: "bg-green-100 text-green-800",
  sold: "bg-red-100 text-red-700",
  rented: "bg-brand-100 text-brand-700",
}

export const ADMIN_API_MESSAGES = {
  NO_SESSION: "no session",
  FORBIDDEN: "forbidden",
  SERVER_MISCONFIGURATION: "server misconfiguration",
  PROPERTY_NOT_FOUND: "property not found",
  NO_ROWS_DELETED: "no rows deleted",
  IMAGE_CLEANUP_FAILED: "image cleanup failed",
} as const

export const ADMIN_API_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const
