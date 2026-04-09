type SecurityLogLevel = "warn" | "error"

type SecurityLogInput = {
  level: SecurityLogLevel
  event: "api_error_sanitized"
  requestId: string
  status: number
  route?: string
  method?: string
  internalCause?: string
}

function buildLogPayload(input: SecurityLogInput) {
  return {
    event: input.event,
    requestId: input.requestId,
    status: input.status,
    route: input.route,
    method: input.method,
    internalCause: input.internalCause,
  }
}

export function logSecurityEvent(input: SecurityLogInput): void {
  const payload = buildLogPayload(input)

  if (input.level === "error") {
    console.error("security_event", payload)
    return
  }

  console.warn("security_event", payload)
}
