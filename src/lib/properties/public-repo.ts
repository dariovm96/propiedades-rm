import { supabase } from "@/lib/supabase"
import type {
  OperationSlug,
  PropertySeoDetail,
  PropertySeoListItem,
  PropertySeoRecord,
  PropertySeoSitemapItem,
  PropertyTypeSlug,
} from "@/types/property-seo"
import { OPERATION_TO_DB_FIELD } from "@/lib/seo/constants"
import type { PropertyHighlight } from "@/types/property-highlight"

const PROPERTY_SEO_SELECT = [
  "id",
  "slug",
  "title",
  "description",
  "price",
  "area_m2",
  "status",
  "images",
  "property_type",
  "for_sale",
  "for_rent",
  "region",
  "region_slug",
  "commune",
  "commune_slug",
  "latitude",
  "longitude",
  "highlighted",
  "location_text",
  "contact_phone",
  "created_at",
].join(",")

const PROPERTY_HIGHLIGHTS_SELECT = "id,property_id,sort_order,highlight,text,title,label,name,value,description"

export async function getSeoPropertiesByListing(input: {
  tipo: PropertyTypeSlug | string
  operacion: OperationSlug
  region_slug?: string | null
  commune_slug?: string | null
  limit?: number
  offset?: number
}): Promise<PropertySeoListItem[]> {
  let query = supabase
    .from("properties")
    .select(PROPERTY_SEO_SELECT)
    .eq("property_type", input.tipo)

  const operationField = OPERATION_TO_DB_FIELD[input.operacion]
  query = query.eq(operationField, true)

  if (input.region_slug) {
    query = query.eq("region_slug", input.region_slug)
  }

  if (input.commune_slug) {
    query = query.eq("commune_slug", input.commune_slug)
  }

  if (typeof input.offset === "number" && typeof input.limit === "number") {
    query = query.range(input.offset, input.offset + input.limit - 1)
  } else if (typeof input.limit === "number") {
    query = query.limit(input.limit)
  }

  const { data, error } = await query.order("created_at", { ascending: false }).returns<PropertySeoRecord[]>()

  if (error || !data) {
    return []
  }

  return data
}

export async function getSeoPropertyBySlug(slug: string): Promise<PropertySeoDetail | null> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SEO_SELECT)
    .eq("slug", slug)
    .limit(1)
    .returns<PropertySeoRecord[]>()
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data
}

export async function getSeoSitemapProperties(limit = 1000): Promise<PropertySeoSitemapItem[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("slug,property_type,region_slug,commune_slug,updated_at,created_at,for_sale,for_rent")
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<PropertySeoSitemapItem[]>()

  if (error || !data) {
    return []
  }

  return data
}

export async function getPublicPropertyHighlightsByPropertyId(propertyId: string): Promise<PropertyHighlight[]> {
  const { data, error } = await supabase
    .from("property_highlights")
    .select(PROPERTY_HIGHLIGHTS_SELECT)
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .returns<PropertyHighlight[]>()

  if (error || !data) {
    return []
  }

  return data
}
