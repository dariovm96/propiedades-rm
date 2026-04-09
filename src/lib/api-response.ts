import { NextResponse } from "next/server"
import { withSecurityHeaders } from "@/lib/security/headers"
import { logSecurityEvent } from "@/lib/observability/security-logger"
import { sanitizeError } from "@/lib/security/error-sanitizer"

type JsonErrorMeta = Record<string, unknown>
type JsonSuccessMeta = Record<string, unknown>
type ApiResponseSecurityOptions = {
  isProduction?: boolean
  request?: Request
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function jsonError(error: unknown, status: number, meta?: JsonErrorMeta, options?: ApiResponseSecurityOptions) {
  const requestId = createRequestId()
  const sanitized = sanitizeError({
    status,
    error,
    requestId,
  })

  if (sanitized.internalCause) {
    logSecurityEvent({
      level: status >= 500 ? "error" : "warn",
      event: "api_error_sanitized",
      requestId,
      status,
      route: options?.request ? new URL(options.request.url).pathname : undefined,
      method: options?.request?.method,
      internalCause: sanitized.internalCause,
    })
  }

  return withSecurityHeaders(NextResponse.json(
    {
      ...sanitized.envelope,
      ...(meta ?? {}),
    },
    { status }
  ), options)
}

export function jsonSuccess(meta?: JsonSuccessMeta, status = 200, options?: ApiResponseSecurityOptions) {
  return withSecurityHeaders(NextResponse.json(
    {
      success: true,
      ...(meta ?? {}),
    },
    { status }
  ), options)
}
