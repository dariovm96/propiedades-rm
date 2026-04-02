const ADMIN_DASHBOARD_PATH = "/admin/dashboard" as const
const ADMIN_LOGIN_PATH = "/admin/login" as const

export type AdminLandingPath = typeof ADMIN_DASHBOARD_PATH | typeof ADMIN_LOGIN_PATH

type ResolveAdminLandingParams = {
  hasUser: boolean
  userEmail?: string | null
  allowedEmails: string[]
}

export function resolveAdminLanding({
  hasUser,
  userEmail,
  allowedEmails,
}: ResolveAdminLandingParams): AdminLandingPath {
  if (!hasUser) {
    return ADMIN_LOGIN_PATH
  }

  const normalizedUserEmail = userEmail?.trim().toLowerCase()
  if (!normalizedUserEmail) {
    return ADMIN_LOGIN_PATH
  }

  if (allowedEmails.length === 0) {
    return ADMIN_LOGIN_PATH
  }

  return allowedEmails.includes(normalizedUserEmail) ? ADMIN_DASHBOARD_PATH : ADMIN_LOGIN_PATH
}
