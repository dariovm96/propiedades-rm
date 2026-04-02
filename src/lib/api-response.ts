import { NextResponse } from "next/server"
import { withSecurityHeaders } from "@/lib/security/headers"

type JsonErrorMeta = Record<string, unknown>
type JsonSuccessMeta = Record<string, unknown>

export function jsonError(error: string, status: number, meta?: JsonErrorMeta) {
  return withSecurityHeaders(NextResponse.json(
    {
      error,
      ...(meta ?? {}),
    },
    { status }
  ))
}

export function jsonSuccess(meta?: JsonSuccessMeta, status = 200) {
  return withSecurityHeaders(NextResponse.json(
    {
      success: true,
      ...(meta ?? {}),
    },
    { status }
  ))
}
