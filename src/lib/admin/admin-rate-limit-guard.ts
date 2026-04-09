import { NextRequest, NextResponse } from "next/server"

import { ADMIN_API_MESSAGES, ADMIN_API_STATUS } from "@/lib/constants"
import { buildRateLimitBucketKey, checkRateLimit, RateLimitConfig } from "@/lib/admin/rate-limit"
import { withSecurityHeaders } from "@/lib/security/headers"
import { sanitizeError } from "@/lib/security/error-sanitizer"

type AdminRateLimitRouteKey =
  | "admin_propiedades_create"
  | "admin_propiedades_update_delete"
  | "admin_propiedades_highlights_mutation"

const RATE_LIMIT_BY_ROUTE: Record<AdminRateLimitRouteKey, RateLimitConfig> = {
  admin_propiedades_create: {
    keyPrefix: "admin",
    windowMs: 60_000,
    max: 20,
  },
  admin_propiedades_update_delete: {
    keyPrefix: "admin",
    windowMs: 60_000,
    max: 30,
  },
  admin_propiedades_highlights_mutation: {
    keyPrefix: "admin",
    windowMs: 60_000,
    max: 45,
  },
}

type WithAdminRateLimitInput = {
  routeKey: AdminRateLimitRouteKey
  adminEmail?: string | null
}

function resolveClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",")
    return firstIp?.trim() || "unknown"
  }

  return req.headers.get("x-real-ip") || "unknown"
}

function hashBucketKey(value: string): string {
  let hash = 5381
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }

  return (hash >>> 0).toString(16)
}

export async function withAdminRateLimit(
  req: NextRequest,
  input: WithAdminRateLimitInput
): Promise<NextResponse | null> {
  const config = RATE_LIMIT_BY_ROUTE[input.routeKey]
  const ip = resolveClientIp(req)
  const adminEmail = input.adminEmail?.trim().toLowerCase() || "unknown-admin"
  const baseKey = `${input.routeKey}:${ip}:${adminEmail}`
  const bucketKey = buildRateLimitBucketKey(baseKey, config)

  const decision = await checkRateLimit(bucketKey, config)
  if (decision.allowed) {
    return null
  }

  console.warn("admin_rate_limit_blocked", {
    route: input.routeKey,
    method: req.method,
    bucketKeyHash: hashBucketKey(bucketKey),
    retryAfterSec: decision.retryAfterSec,
  })

  const requestId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  const sanitized = sanitizeError({
    status: ADMIN_API_STATUS.TOO_MANY_REQUESTS,
    error: ADMIN_API_MESSAGES.RATE_LIMIT_EXCEEDED,
    requestId,
  })

  return withSecurityHeaders(NextResponse.json(
    sanitized.envelope,
    {
      status: ADMIN_API_STATUS.TOO_MANY_REQUESTS,
      headers: {
        "Retry-After": String(decision.retryAfterSec),
      },
    }
  ), { request: req })
}
