import { ADMIN_API_MESSAGES, ADMIN_API_STATUS } from "@/lib/constants"
import { jsonError } from "@/lib/api-response"

export function getAllowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false

  const normalizedEmail = email.trim().toLowerCase()
  const allowedAdminEmails = getAllowedAdminEmails()

  return allowedAdminEmails.includes(normalizedEmail)
}

type AdminGuardSupabase = {
  auth: {
    getUser: () => Promise<{
      data: { user: { email?: string | null } | null }
      error: unknown
    }>
  }
}

export async function requireAdminUser(supabase: AdminGuardSupabase) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return {
      response: jsonError(ADMIN_API_MESSAGES.NO_SESSION, ADMIN_API_STATUS.UNAUTHORIZED),
    }
  }

  const allowedAdminEmails = getAllowedAdminEmails()
  if (allowedAdminEmails.length === 0) {
    return {
      response: jsonError(
        ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION,
        ADMIN_API_STATUS.INTERNAL_SERVER_ERROR
      ),
    }
  }

  if (!isAllowedAdminEmail(user.email)) {
    return {
      response: jsonError(ADMIN_API_MESSAGES.FORBIDDEN, ADMIN_API_STATUS.FORBIDDEN),
    }
  }

  return { user }
}