import { getAllowedAdminEmails } from "@/lib/admin-auth"
import { ADMIN_API_MESSAGES, ADMIN_API_STATUS } from "@/lib/constants"
import { jsonError, jsonSuccess } from "@/lib/api-response"
import { createRouteSupabaseClient } from "@/lib/server-supabase"

export async function GET() {
  const supabase = await createRouteSupabaseClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return jsonError(ADMIN_API_MESSAGES.NO_SESSION, ADMIN_API_STATUS.UNAUTHORIZED)
    }

    const allowedAdminEmails = getAllowedAdminEmails()
    if (allowedAdminEmails.length === 0) {
      return jsonError(
        ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION,
        ADMIN_API_STATUS.INTERNAL_SERVER_ERROR
      )
    }

    const sessionEmail = session.user.email?.trim().toLowerCase()
    if (!sessionEmail || !allowedAdminEmails.includes(sessionEmail)) {
      return jsonError(ADMIN_API_MESSAGES.FORBIDDEN, ADMIN_API_STATUS.FORBIDDEN)
    }

    return jsonSuccess({ authorized: true }, ADMIN_API_STATUS.OK)
  } catch {
    return jsonError(ADMIN_API_MESSAGES.NO_SESSION, ADMIN_API_STATUS.UNAUTHORIZED)
  }
}
