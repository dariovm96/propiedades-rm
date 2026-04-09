type RequestProtocol = "http" | "https"

type SecurityHeadersOptions = {
  isProduction?: boolean
  requestProtocol?: RequestProtocol
}

type WithSecurityHeadersOptions = SecurityHeadersOptions & {
  request?: Request
}

const BASE_SECURITY_HEADERS_ENTRIES = [
  ["X-Frame-Options", "DENY"],
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
  ["Cross-Origin-Opener-Policy", "same-origin"],
] as const satisfies readonly (readonly [string, string])[]

const HSTS_HEADER_ENTRY = ["Strict-Transport-Security", "max-age=31536000; includeSubDomains"] as const

function resolveIsProduction(isProductionOverride?: boolean): boolean {
  return isProductionOverride ?? process.env.NODE_ENV === "production"
}

function resolveRequestProtocol(options: WithSecurityHeadersOptions): RequestProtocol | undefined {
  if (options.requestProtocol) {
    return options.requestProtocol
  }

  if (!options.request) {
    return undefined
  }

  const forwardedProto = options.request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    ?.toLowerCase()

  if (forwardedProto === "http" || forwardedProto === "https") {
    return forwardedProto
  }

  const forwarded = options.request.headers.get("forwarded")
  const protoMatch = forwarded?.match(/proto=(https?)/i)
  const protoFromForwarded = protoMatch?.[1]?.toLowerCase()

  if (protoFromForwarded === "http" || protoFromForwarded === "https") {
    return protoFromForwarded
  }

  try {
    const protocol = new URL(options.request.url).protocol.replace(":", "").toLowerCase()
    if (protocol === "http" || protocol === "https") {
      return protocol
    }
  } catch {
    return undefined
  }

  return undefined
}

function buildContentSecurityPolicy(isProduction: boolean): string {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
    `connect-src 'self' https:${isProduction ? " wss:" : " http: ws: wss:"}`,
    "frame-src 'self' https:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ]

  return directives.join("; ")
}

export function getSecurityHeaders(options: SecurityHeadersOptions = {}): Record<string, string> {
  const isProduction = resolveIsProduction(options.isProduction)
  const requestProtocol = options.requestProtocol

  const headers: Array<readonly [string, string]> = [
    ...BASE_SECURITY_HEADERS_ENTRIES,
    ["Content-Security-Policy", buildContentSecurityPolicy(isProduction)],
  ]

  const shouldIncludeHsts =
    isProduction && (requestProtocol === undefined || requestProtocol === "https")

  if (shouldIncludeHsts) {
    headers.push(HSTS_HEADER_ENTRY)
  }

  return Object.fromEntries(headers)
}

export const SECURITY_HEADERS = getSecurityHeaders()

export function withSecurityHeaders<T extends Response>(response: T, options: WithSecurityHeadersOptions = {}): T {
  const headers = getSecurityHeaders({
    isProduction: options.isProduction,
    requestProtocol: resolveRequestProtocol(options),
  })

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }

  return response
}
