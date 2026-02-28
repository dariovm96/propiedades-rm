import { NextResponse } from "next/server"

type JsonErrorMeta = Record<string, unknown>
type JsonSuccessMeta = Record<string, unknown>

export function jsonError(error: string, status: number, meta?: JsonErrorMeta) {
  return NextResponse.json(
    {
      error,
      ...(meta ?? {}),
    },
    { status }
  )
}

export function jsonSuccess(meta?: JsonSuccessMeta, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...(meta ?? {}),
    },
    { status }
  )
}