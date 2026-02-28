import { createServerClient } from "@supabase/ssr"
import { cookies as getCookies } from "next/headers"

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