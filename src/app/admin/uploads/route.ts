import { NextRequest } from "next/server"

import { requireAdminUser } from "@/lib/admin-auth"
import { jsonError, jsonSuccess } from "@/lib/api-response"
import { ADMIN_API_MESSAGES, ADMIN_API_STATUS } from "@/lib/constants"
import { enforceAdminCsrf } from "@/lib/security/csrf"
import { createRouteSupabaseClient, requireServiceRoleClient } from "@/lib/server-supabase"
import { uploadImagesWithServiceRole } from "@/lib/storage"

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isValidUploadFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0
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

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST, undefined, { request: req })
  }

  const propertyId = formData.get("propertyId")
  if (!isNonEmptyString(propertyId)) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST, {
      message: "propertyId is required",
    }, { request: req })
  }

  const files = formData.getAll("files").filter(isValidUploadFile)
  if (files.length === 0) {
    return jsonError(ADMIN_API_MESSAGES.INVALID_REQUEST, ADMIN_API_STATUS.BAD_REQUEST, {
      message: "at least one file is required",
    }, { request: req })
  }

  let adminSupabase
  try {
    adminSupabase = requireServiceRoleClient()
  } catch {
    return jsonError(ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR, undefined, { request: req })
  }

  try {
    const paths = await uploadImagesWithServiceRole(adminSupabase, propertyId, files)
    return jsonSuccess({ paths })
  } catch (error) {
    return jsonError(error, ADMIN_API_STATUS.BAD_REQUEST, undefined, { request: req })
  }
}
