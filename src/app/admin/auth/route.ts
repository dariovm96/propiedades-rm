import { requireAdminUser } from "@/lib/admin-auth"
import { ADMIN_API_STATUS } from "@/lib/constants"
import { jsonSuccess } from "@/lib/api-response"
import { createRouteSupabaseClient } from "@/lib/server-supabase"

export async function GET() {
  const supabase = await createRouteSupabaseClient()

  const auth = await requireAdminUser(supabase)
  if ("response" in auth) {
    return auth.response
  }

  return jsonSuccess({ authorized: true }, ADMIN_API_STATUS.OK)
}
