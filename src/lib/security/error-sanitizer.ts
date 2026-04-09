export type SafeErrorCode =
  | "internal_error"
  | "bad_request"
  | "forbidden"
  | "rate_limited"
  | "unauthorized"
  | "not_found"

export type SafeErrorEnvelope = {
  error: SafeErrorCode
  message: string
  requestId: string
}

type SanitizeErrorInput = {
  status: number
  error: unknown
  requestId: string
}

export type SanitizedErrorResult = {
  envelope: SafeErrorEnvelope
  internalCause?: string
}

const GENERIC_INTERNAL_MESSAGE = "internal server error"

const STATUS_DEFAULTS: Record<number, { code: SafeErrorCode; message: string }> = {
  400: { code: "bad_request", message: "invalid request" },
  401: { code: "unauthorized", message: "unauthorized" },
  403: { code: "forbidden", message: "forbidden" },
  404: { code: "not_found", message: "not found" },
  429: { code: "rate_limited", message: "rate limit exceeded" },
}

const SENSITIVE_PATTERNS = [
  /\bselect\b.+\bfrom\b/i,
  /\binsert\b.+\binto\b/i,
  /\bupdate\b.+\bset\b/i,
  /\bdelete\b.+\bfrom\b/i,
  /\bsupabase\b/i,
  /\bpostgres\b/i,
  /\bsql\b/i,
  /\bstack\b/i,
  /\btoken\b/i,
  /\bsecret\b/i,
  /\bpassword\b/i,
  /\bkey\b/i,
] as const

function toMessage(error: unknown): string | undefined {
  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message
  }

  return undefined
}

function isSensitiveMessage(message: string): boolean {
  const trimmed = message.trim()
  if (!trimmed) {
    return true
  }

  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(trimmed))
}

function getDefaultByStatus(status: number): { code: SafeErrorCode; message: string } {
  if (status >= 500) {
    return { code: "internal_error", message: GENERIC_INTERNAL_MESSAGE }
  }

  return STATUS_DEFAULTS[status] ?? { code: "bad_request", message: "request failed" }
}

export function sanitizeError(input: SanitizeErrorInput): SanitizedErrorResult {
  const defaultEnvelope = getDefaultByStatus(input.status)
  const rawMessage = toMessage(input.error)

  if (input.status >= 500) {
    return {
      envelope: {
        error: defaultEnvelope.code,
        message: defaultEnvelope.message,
        requestId: input.requestId,
      },
      internalCause: rawMessage,
    }
  }

  if (!rawMessage || isSensitiveMessage(rawMessage)) {
    return {
      envelope: {
        error: defaultEnvelope.code,
        message: defaultEnvelope.message,
        requestId: input.requestId,
      },
      internalCause: rawMessage,
    }
  }

  return {
    envelope: {
      error: defaultEnvelope.code,
      message: rawMessage,
      requestId: input.requestId,
    },
  }
}
