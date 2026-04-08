import { redirect } from "next/navigation"
import { getAllowedAdminEmails } from "@/lib/admin-auth"
import { resolveAdminLanding } from "@/lib/admin/session-server"
import { createRouteSupabaseClient } from "@/lib/server-supabase"

export default async function AdminRootPage() {
  const supabase = await createRouteSupabaseClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  const destination = resolveAdminLanding({
    hasUser: Boolean(user) && !error,
    userEmail: user?.email,
    allowedEmails: getAllowedAdminEmails(),
  })

  redirect(destination)
}
