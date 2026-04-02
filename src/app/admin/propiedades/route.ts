import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireAdminUser } from "@/lib/admin-auth"
import { jsonError, jsonSuccess } from "@/lib/api-response"
import { ADMIN_API_MESSAGES, ADMIN_API_STATUS } from "@/lib/constants"
import { validatePropertySeoPayload } from "@/lib/admin/property-seo-validation"
import { createRouteSupabaseClient } from "@/lib/server-supabase"

type JsonObject = Record<string, unknown>

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getServiceRoleSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function POST(req: NextRequest) {
  const serverSupabase = await createRouteSupabaseClient()
  const guard = await requireAdminUser(serverSupabase)
  if ("response" in guard) {
    return guard.response
  }

  const adminSupabase = getServiceRoleSupabase()
  if (!adminSupabase) {
    return jsonError(
      ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION,
      ADMIN_API_STATUS.INTERNAL_SERVER_ERROR
    )
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

  const validation = validatePropertySeoPayload(payload)
  if (!validation.ok) {
    return jsonError(ADMIN_API_MESSAGES.SEO_VALIDATION_FAILED, ADMIN_API_STATUS.BAD_REQUEST, {
      errors: validation.errors,
    })
  }

  const { data, error } = await adminSupabase.from("properties").insert(payload).select("*").single()

  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  return jsonSuccess({ property: data }, 201)
}
