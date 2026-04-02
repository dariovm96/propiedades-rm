export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: "property-images",
}

export const IMAGE_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const IMAGE_MAX_SIZE_MB = 5
export const IMAGE_MAX_SIZE_BYTES = IMAGE_MAX_SIZE_MB * 1024 * 1024
export const IMAGE_MIN_LONGEST_SIDE_PX = 1600
export const IMAGE_RECOMMENDED_ASPECT_RATIOS = [4 / 3, 3 / 2] as const
export const IMAGE_RECOMMENDED_ASPECT_RATIO_TOLERANCE = 0.08

export const PROPERTY_STATUS_OPTIONS = ["available", "sold", "rented"] as const
export type PropertyStatus = (typeof PROPERTY_STATUS_OPTIONS)[number]

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: "Disponible",
  sold: "Vendida",
  rented: "Arrendada",
}

export const PROPERTY_STATUS_BADGE_CLASSES: Record<PropertyStatus, string> = {
  available: "border border-green-200 bg-green-100 text-green-800 dark:border-green-300/20 dark:bg-green-400/15 dark:text-green-200",
  sold: "border border-red-200 bg-red-100 text-red-700 dark:border-red-300/20 dark:bg-red-400/15 dark:text-red-200",
  rented: "border border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-300/20 dark:bg-amber-400/15 dark:text-amber-200",
}

export const ADMIN_API_MESSAGES = {
  NO_SESSION: "no session",
  FORBIDDEN: "forbidden",
  SERVER_MISCONFIGURATION: "server misconfiguration",
  PROPERTY_NOT_FOUND: "property not found",
  INVALID_REQUEST: "invalid request",
  SEO_VALIDATION_FAILED: "seo validation failed",
  INVALID_HIGHLIGHT: "invalid highlight",
  HIGHLIGHT_NOT_FOUND: "highlight not found",
  NO_ROWS_DELETED: "no rows deleted",
  IMAGE_CLEANUP_FAILED: "image cleanup failed",
} as const

export const ADMIN_API_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const
