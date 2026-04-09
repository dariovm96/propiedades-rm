import { NextRequest } from "next/server"
import { requireAdminUser } from "@/lib/admin-auth"
import { jsonError, jsonSuccess } from "@/lib/api-response"
import { ADMIN_API_MESSAGES, ADMIN_API_STATUS } from "@/lib/constants"
import { validatePropertySeoPayload } from "@/lib/admin/property-seo-validation"
import { createRouteSupabaseClient, requireServiceRoleClient } from "@/lib/server-supabase"
import { withAdminRateLimit } from "@/lib/admin/admin-rate-limit-guard"
import { enforceAdminCsrf } from "@/lib/security/csrf"

type JsonObject = Record<string, unknown>

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export async function POST(req: NextRequest) {
  const serverSupabase = await createRouteSupabaseClient()
  const guard = await requireAdminUser(serverSupabase)
  if ("response" in guard) {
    return guard.response
  }

  const csrfDecision = enforceAdminCsrf(req)
  if (!csrfDecision.ok) {
    return csrfDecision.response
  }

  const rateLimited = await withAdminRateLimit(req, {
    routeKey: "admin_propiedades_create",
    adminEmail: guard.user.email,
  })
  if (rateLimited) {
    return rateLimited
  }

  let adminSupabase
  try {
    adminSupabase = requireServiceRoleClient()
  } catch {
    return jsonError(ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR, undefined, { request: req })
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST, undefined, { request: req })
  }

  if (!isPlainObject(payload)) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST, undefined, { request: req })
  }

  const validation = validatePropertySeoPayload(payload)
  if (!validation.ok) {
    return jsonError(ADMIN_API_MESSAGES.SEO_VALIDATION_FAILED, ADMIN_API_STATUS.BAD_REQUEST, {
      errors: validation.errors,
    }, { request: req })
  }

  const { data, error } = await adminSupabase.from("properties").insert(payload).select("*").single()

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR, undefined, { request: req })
  }

  return jsonSuccess({ property: data }, 201)
}
