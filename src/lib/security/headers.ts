const SECURITY_HEADERS_ENTRIES = [
  ["X-Frame-Options", "DENY"],
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
  ["Cross-Origin-Opener-Policy", "same-origin"],
] as const

export const SECURITY_HEADERS: Record<string, string> = Object.fromEntries(SECURITY_HEADERS_ENTRIES)

export function withSecurityHeaders<T extends Response>(response: T): T {
  for (const [key, value] of SECURITY_HEADERS_ENTRIES) {
    response.headers.set(key, value)
  }

  return response
}
