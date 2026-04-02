import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminUser } from "@/lib/admin-auth"
import { jsonError, jsonSuccess } from "@/lib/api-response"
import { ADMIN_API_MESSAGES, ADMIN_API_STATUS } from "@/lib/constants"
import { createRouteSupabaseClient } from "@/lib/server-supabase"
import {
  PROPERTY_HIGHLIGHT_TEXT_COLUMNS,
  PropertyHighlight,
  PropertyHighlightCreateRequest,
  PropertyHighlightDeleteRequest,
  PropertyHighlightUpdateRequest,
} from "@/types/property-highlight"

type RouteCtx = { params: Promise<{ id: string }> }

type JsonObject = Record<string, unknown>
type AdminSupabaseClient = NonNullable<ReturnType<typeof getServiceRoleSupabase>>

function getServiceRoleSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function extractHighlightText(value: unknown): string | null {
  if (!isPlainObject(value)) {
    return null
  }

  const candidates = [value.text, ...PROPERTY_HIGHLIGHT_TEXT_COLUMNS.map((column) => value[column])]
  const valid = candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0
  )

  return typeof valid === "string" ? valid.trim() : null
}

function stripHighlightTextKeys(value: JsonObject): JsonObject {
  const stripped = { ...value }
  delete stripped.text
  for (const key of PROPERTY_HIGHLIGHT_TEXT_COLUMNS) {
    delete stripped[key]
  }
  return stripped
}

function buildHighlightPayloadVariants(
  base: JsonObject,
  highlightText: string
): JsonObject[] {
  const withoutTextKeys = stripHighlightTextKeys(base)
  return PROPERTY_HIGHLIGHT_TEXT_COLUMNS.map((column) => ({
    ...withoutTextKeys,
    [column]: highlightText,
  }))
}

async function tryInsertHighlightVariants(
  adminSupabase: AdminSupabaseClient,
  variants: JsonObject[]
) {
  let lastErrorMessage: string = ADMIN_API_MESSAGES.INVALID_HIGHLIGHT

  for (const variant of variants) {
    const { data, error } = await adminSupabase
      .from("property_highlights")
      .insert(variant)
      .select("*")
      .single()

    if (!error) {
      return { data: data as PropertyHighlight, error: null as null }
    }

    lastErrorMessage = error.message
  }

  return { data: null as PropertyHighlight | null, error: { message: lastErrorMessage } }
}

async function tryUpdateHighlightVariants(
  adminSupabase: AdminSupabaseClient,
  propertyId: string,
  highlightId: string,
  variants: JsonObject[]
) {
  let lastErrorMessage: string = ADMIN_API_MESSAGES.INVALID_HIGHLIGHT

  for (const variant of variants) {
    const { data, error } = await adminSupabase
      .from("property_highlights")
      .update(variant)
      .eq("id", highlightId)
      .eq("property_id", propertyId)
      .select("*")

    if (!error) {
      return { data: (data as PropertyHighlight[]) ?? [], error: null as null }
    }

    lastErrorMessage = error.message
  }

  return { data: null as PropertyHighlight[] | null, error: { message: lastErrorMessage } }
}

async function parseJsonSafely(req: NextRequest): Promise<unknown | null> {
  try {
    return await req.json()
  } catch {
    return null
  }
}

async function requireAdminRouteAccess() {
  const serverSupabase = await createRouteSupabaseClient()
  const guard = await requireAdminUser(serverSupabase)

  if ("response" in guard) {
    return { errorResponse: guard.response }
  }

  const adminSupabase = getServiceRoleSupabase()
  if (!adminSupabase) {
    return {
      errorResponse: jsonError(
        ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION,
        ADMIN_API_STATUS.INTERNAL_SERVER_ERROR
      ),
    }
  }

  return { adminSupabase }
}

export async function GET(_req: NextRequest, ctx: RouteCtx) {
  const { id: propertyId } = await ctx.params
  const access = await requireAdminRouteAccess()
  if ("errorResponse" in access) {
    return access.errorResponse
  }

  const { data, error } = await access.adminSupabase
    .from("property_highlights")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  return jsonSuccess({ highlights: ((data as PropertyHighlight[] | null) ?? []) })
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { id: propertyId } = await ctx.params
  const access = await requireAdminRouteAccess()
  if ("errorResponse" in access) {
    return access.errorResponse
  }

  const payload = await parseJsonSafely(req)
  if (!isPlainObject(payload)) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const typedPayload = payload as PropertyHighlightCreateRequest

  const candidate = isPlainObject(typedPayload.highlight) ? typedPayload.highlight : typedPayload
  if (!isPlainObject(candidate)) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_HIGHLIGHT, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const insertData: JsonObject = {
    ...candidate,
    property_id: propertyId,
  }

  delete insertData["id"]

  const textValue = extractHighlightText(insertData)
  const variants: JsonObject[] = textValue
    ? buildHighlightPayloadVariants(insertData, textValue)
    : [insertData]

  const { data, error } = await tryInsertHighlightVariants(access.adminSupabase, variants)

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  return jsonSuccess({ highlight: data })
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { id: propertyId } = await ctx.params
  const access = await requireAdminRouteAccess()
  if ("errorResponse" in access) {
    return access.errorResponse
  }

  const payload = await parseJsonSafely(req)
  if (!isPlainObject(payload)) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const typedPayload = payload as PropertyHighlightUpdateRequest

  const highlightId =
    (typeof typedPayload.highlightId === "string" && typedPayload.highlightId) ||
    (typeof typedPayload.id === "string" && typedPayload.id)

  if (!highlightId) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const updateCandidate =
    isPlainObject(typedPayload.data)
      ? typedPayload.data
      : isPlainObject(typedPayload.highlight)
      ? typedPayload.highlight
      : typedPayload.text
      ? {
          text: typedPayload.text,
          ...(typeof typedPayload.sort_order === "number"
            ? { sort_order: typedPayload.sort_order }
            : {}),
        }
      : typeof typedPayload.sort_order === "number"
      ? { sort_order: typedPayload.sort_order }
      : null

  if (!updateCandidate) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_HIGHLIGHT, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const updateData: JsonObject = {
    ...updateCandidate,
  }
  delete updateData.id
  delete updateData.property_id

  const textValue = extractHighlightText(updateData)
  const updateDataWithoutText = stripHighlightTextKeys(updateData)
  const variants: JsonObject[] = textValue
    ? buildHighlightPayloadVariants(updateDataWithoutText, textValue)
    : [updateDataWithoutText]

  if (Object.keys(updateDataWithoutText).length === 0 && !textValue) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_HIGHLIGHT, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const { data, error } = await tryUpdateHighlightVariants(
    access.adminSupabase,
    propertyId,
    highlightId,
    variants
  )

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  if (!data || data.length === 0) {
    return jsonError(ADMIN_API_MESSAGES.HIGHLIGHT_NOT_FOUND, ADMIN_API_STATUS.NOT_FOUND)
  }

  return jsonSuccess({ highlight: data[0] })
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { id: propertyId } = await ctx.params
  const access = await requireAdminRouteAccess()
  if ("errorResponse" in access) {
    return access.errorResponse
  }

  const highlightIdFromQuery = req.nextUrl.searchParams.get("highlightId")
  const payload = await parseJsonSafely(req)
  const typedPayload = isPlainObject(payload) ? (payload as PropertyHighlightDeleteRequest) : null
  const highlightIdFromBody = isPlainObject(payload)
    ? typeof typedPayload?.highlightId === "string"
      ? typedPayload.highlightId
      : typeof typedPayload?.id === "string"
      ? typedPayload.id
      : null
    : null

  const highlightId = highlightIdFromQuery || highlightIdFromBody
  if (!highlightId) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const { data, error } = await access.adminSupabase
    .from("property_highlights")
    .delete()
    .select("id")
    .eq("id", highlightId)
    .eq("property_id", propertyId)

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  if (!data || data.length === 0) {
    return jsonError(ADMIN_API_MESSAGES.HIGHLIGHT_NOT_FOUND, ADMIN_API_STATUS.NOT_FOUND)
  }

  return jsonSuccess({ deleted: data })
}
