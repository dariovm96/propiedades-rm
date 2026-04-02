"use client"

import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export type AdminSessionState = "unknown" | "admin" | "non-admin"

const ADMIN_SESSION_CACHE_TTL_MS = 60_000

let cachedAdminSessionState: AdminSessionState | null = null
let cachedAdminSessionExpiresAt = 0
let inflightAdminSessionRequest: Promise<AdminSessionState> | null = null

function readCachedAdminSessionState(now = Date.now()): AdminSessionState | null {
  if (!cachedAdminSessionState) {
    return null
  }

  if (cachedAdminSessionExpiresAt <= now) {
    cachedAdminSessionState = null
    return null
  }

  return cachedAdminSessionState
}

function cacheAdminSessionState(state: AdminSessionState, ttlMs = ADMIN_SESSION_CACHE_TTL_MS) {
  cachedAdminSessionState = state
  cachedAdminSessionExpiresAt = Date.now() + ttlMs
}

async function resolveAdminSessionState(): Promise<AdminSessionState> {
  try {
    const response = await fetch("/admin/auth", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    })

    return response.ok ? "admin" : "non-admin"
  } catch {
    return "non-admin"
  }
}

type GetAdminSessionStateOptions = {
  force?: boolean
  ttlMs?: number
}

export async function getAdminSessionState(options: GetAdminSessionStateOptions = {}): Promise<AdminSessionState> {
  const { force = false, ttlMs = ADMIN_SESSION_CACHE_TTL_MS } = options

  if (!force) {
    const cachedState = readCachedAdminSessionState()
    if (cachedState) {
      return cachedState
    }
  }

  if (inflightAdminSessionRequest) {
    return inflightAdminSessionRequest
  }

  inflightAdminSessionRequest = resolveAdminSessionState()
    .then((state) => {
      cacheAdminSessionState(state, ttlMs)
      return state
    })
    .finally(() => {
      inflightAdminSessionRequest = null
    })

  return inflightAdminSessionRequest
}

export function useAdminSession() {
  const [state, setState] = useState<AdminSessionState>(() => readCachedAdminSessionState() ?? "unknown")

  const refresh = useCallback(async (options: GetAdminSessionStateOptions = {}) => {
    const nextState = await getAdminSessionState(options)
    setState(nextState)
    return nextState
  }, [])

  useEffect(() => {
    let isMounted = true

    if (!readCachedAdminSessionState()) {
      void getAdminSessionState().then((nextState) => {
        if (isMounted) {
          setState(nextState)
        }
      })
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh({ force: true })
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [refresh])

  return {
    state,
    isAdmin: state === "admin",
    isLoading: state === "unknown",
    refresh,
  }
}
