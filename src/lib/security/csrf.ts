import { NextRequest } from "next/server"
import { jsonError } from "@/lib/api-response"
import { ADMIN_API_MESSAGES, ADMIN_API_STATUS } from "@/lib/constants"

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

export type CsrfDecision = { ok: true } | { ok: false; response: Response }

function isHttpOrHttps(url: URL): boolean {
  return url.protocol === "http:" || url.protocol === "https:"
}

function parseHeaderUrl(value: string | null): URL | null {
  if (!value) {
    return null
  }

  try {
    const parsed = new URL(value)
    return isHttpOrHttps(parsed) ? parsed : null
  } catch {
    return null
  }
}

function isSameOrigin(requestUrl: URL, candidateUrl: URL | null): boolean {
  return candidateUrl?.origin === requestUrl.origin
}

export function enforceAdminCsrf(req: NextRequest): CsrfDecision {
  if (!MUTATING_METHODS.has(req.method)) {
    return { ok: true }
  }

  const originUrl = parseHeaderUrl(req.headers.get("origin"))
  const refererUrl = parseHeaderUrl(req.headers.get("referer"))
  const sameOriginByOrigin = isSameOrigin(req.nextUrl, originUrl)
  const sameOriginByReferer = isSameOrigin(req.nextUrl, refererUrl)

  if (!sameOriginByOrigin && !sameOriginByReferer) {
    return {
      ok: false,
      response: jsonError(ADMIN_API_MESSAGES.FORBIDDEN, ADMIN_API_STATUS.FORBIDDEN, undefined, { request: req }),
    }
  }

  return { ok: true }
}
