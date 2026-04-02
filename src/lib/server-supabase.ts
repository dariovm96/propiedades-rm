import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies as getCookies } from "next/headers"

import { ADMIN_API_MESSAGES } from "@/lib/constants"

export async function createRouteSupabaseClient() {
  const cookieStore = await getCookies()

  const cookieMethods = {
    get: (name: string) => {
      const cookie = cookieStore.get(name)
      return cookie ? cookie.value : undefined
    },
    getAll: () => cookieStore.getAll().map((cookie) => ({ name: cookie.name, value: cookie.value })),
    set: () => {},
    remove: () => {},
    setAll: () => {},
    deleteAll: () => {},
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: cookieMethods }
  )
}

export function requireServiceRoleClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    console.warn("admin_service_role_missing", {
      reason: "SUPABASE_SERVICE_ROLE_KEY not configured",
    })

    throw new Error(ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION)
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey)
}
