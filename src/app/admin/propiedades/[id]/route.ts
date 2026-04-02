import { NextRequest } from "next/server"
import { ADMIN_API_MESSAGES, ADMIN_API_STATUS, STORAGE_BUCKETS } from "@/lib/constants"
import { requireAdminUser } from "@/lib/admin-auth"
import { jsonError, jsonSuccess } from "@/lib/api-response"
import { createRouteSupabaseClient, requireServiceRoleClient } from "@/lib/server-supabase"
import { validatePropertySeoPayload } from "@/lib/admin/property-seo-validation"
import { withAdminRateLimit } from "@/lib/admin/admin-rate-limit-guard"
import { enforceAdminCsrf } from "@/lib/security/csrf"

type JsonObject = Record<string, unknown>

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isHighlightOnlyPayload(payload: JsonObject): payload is { highlighted: boolean } {
  return Object.keys(payload).length === 1 && typeof payload.highlighted === "boolean"
}

function hasSeoValidationFields(payload: JsonObject): boolean {
  const keys = [
    "property_type",
    "for_sale",
    "for_rent",
    "region",
    "commune",
    "street",
    "street_number",
    "region_slug",
    "commune_slug",
    "latitude",
    "longitude",
  ]

  return keys.some((key) => key in payload)
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: { id: string } | Promise<{ id: string }> }
) {
  const { id } = (await ctx.params) as { id: string }
  const serverSupabase = await createRouteSupabaseClient()
  const guard = await requireAdminUser(serverSupabase)
  if ("response" in guard) {
    return guard.response
  }

  const csrfDecision = enforceAdminCsrf(req)
  if (!csrfDecision.ok) {
    return csrfDecision.response
  }

  const rateLimited = withAdminRateLimit(req, {
    routeKey: "admin_propiedades_update_delete",
    adminEmail: guard.user.email,
  })
  if (rateLimited) {
    return rateLimited
  }

  let adminSupabase
  try {
    adminSupabase = requireServiceRoleClient()
  } catch {
    return jsonError(ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST)
  }

  if (!isPlainObject(payload)) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST)
  }

  if (isHighlightOnlyPayload(payload)) {
    const { data, error } = await adminSupabase
      .from("properties")
      .update({ highlighted: payload.highlighted })
      .eq("id", id)
      .select("id, highlighted")

    if (error) {
      return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
    }

    if (!data || data.length === 0) {
      return jsonError(ADMIN_API_MESSAGES.PROPERTY_NOT_FOUND, ADMIN_API_STATUS.NOT_FOUND)
    }

    return jsonSuccess({ property: data[0] })
  }

  if (!hasSeoValidationFields(payload)) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST)
  }

  const validation = validatePropertySeoPayload(payload)
  if (!validation.ok) {
    return jsonError(ADMIN_API_MESSAGES.SEO_VALIDATION_FAILED, ADMIN_API_STATUS.BAD_REQUEST, {
      errors: validation.errors,
    })
  }

  const { data, error } = await adminSupabase.from("properties").update(payload).eq("id", id).select("*")

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  if (!data || data.length === 0) {
    return jsonError(ADMIN_API_MESSAGES.PROPERTY_NOT_FOUND, ADMIN_API_STATUS.NOT_FOUND)
  }

  return jsonSuccess({ property: data[0] })
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: { id: string } | Promise<{ id: string }> }
) {
  // unwrap params if it's a promise
  const { id } = (await ctx.params) as { id: string }
  const serverSupabase = await createRouteSupabaseClient()
  const guard = await requireAdminUser(serverSupabase)
  if ("response" in guard) {
    return guard.response
  }

  const csrfDecision = enforceAdminCsrf(req)
  if (!csrfDecision.ok) {
    return csrfDecision.response
  }

  const rateLimited = withAdminRateLimit(req, {
    routeKey: "admin_propiedades_update_delete",
    adminEmail: guard.user.email,
  })
  if (rateLimited) {
    return rateLimited
  }

  // perform deletion with service role key to bypass RLS
  let adminSupabase
  try {
    adminSupabase = requireServiceRoleClient()
  } catch {
    return jsonError(ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  // fetch property first to know which images to clean up
  const { data: propertyData, error: fetchError } = await adminSupabase
    .from("properties")
    .select("images")
    .eq("id", id)
    .single()

  if (fetchError) {
    // if property doesn't exist treat as not found
    if (fetchError.code === "PGRST116") {
      return jsonError(ADMIN_API_MESSAGES.PROPERTY_NOT_FOUND, ADMIN_API_STATUS.NOT_FOUND)
    }
    return jsonError(fetchError.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  const imagesToRemove: string[] = propertyData?.images || []

  // now delete the row
  const { data: deleted, error } = await adminSupabase
    .from("properties")
    .delete()
    .select("id")
    .eq("id", id)


  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  if (!deleted || deleted.length === 0) {
    return jsonError(ADMIN_API_MESSAGES.NO_ROWS_DELETED, ADMIN_API_STATUS.NOT_FOUND)
  }

  // attempt to remove related images
  if (imagesToRemove.length > 0) {
    const { error: storageErr } = await adminSupabase.storage
      .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
      .remove(imagesToRemove)

    if (storageErr) {
      // we don't fail the whole request, but return warning
      return jsonSuccess({
        deleted,
        warning: ADMIN_API_MESSAGES.IMAGE_CLEANUP_FAILED,
        storageError: storageErr.message,
      })
    }
  }

  return jsonSuccess({ deleted })
}
