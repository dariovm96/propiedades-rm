import { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { ADMIN_API_MESSAGES, ADMIN_API_STATUS, STORAGE_BUCKETS } from "@/lib/constants"
import { requireAdminUser } from "@/lib/admin-auth"
import { jsonError, jsonSuccess } from "@/lib/api-response"
import { createRouteSupabaseClient } from "@/lib/server-supabase"

export async function DELETE(
  req: NextRequest,
  ctx: { params: { id: string } | Promise<{ id: string }> }
) {
  // unwrap params if it's a promise
  const { id } = (await ctx.params) as { id: string }
  const serverSupabase = await createRouteSupabaseClient()
  const guard = await requireAdminUser(serverSupabase)
  if ("response" in guard) {
    return guard.response
  }

  // perform deletion with service role key to bypass RLS
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return jsonError(
      ADMIN_API_MESSAGES.SERVER_MISCONFIGURATION,
      ADMIN_API_STATUS.INTERNAL_SERVER_ERROR
    )
  }

  // fetch property first to know which images to clean up
  const { data: propertyData, error: fetchError } = await adminSupabase
    .from("properties")
    .select("images")
    .eq("id", id)
    .single()

  if (fetchError) {
    // if property doesn't exist treat as not found
    if (fetchError.code === "PGRST116") {
      return jsonError(ADMIN_API_MESSAGES.PROPERTY_NOT_FOUND, ADMIN_API_STATUS.NOT_FOUND)
    }
    return jsonError(fetchError.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  const imagesToRemove: string[] = propertyData?.images || []

  // now delete the row
  const { data: deleted, error } = await adminSupabase
    .from("properties")
    .delete()
    .select("id")
    .eq("id", id)


  if (error) {
    return jsonError(error.message, ADMIN_API_STATUS.INTERNAL_SERVER_ERROR)
  }

  if (!deleted || deleted.length === 0) {
    return jsonError(ADMIN_API_MESSAGES.NO_ROWS_DELETED, ADMIN_API_STATUS.NOT_FOUND)
  }

  // attempt to remove related images
  if (imagesToRemove.length > 0) {
    const { error: storageErr } = await adminSupabase.storage
      .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
      .remove(imagesToRemove)

    if (storageErr) {
      // we don't fail the whole request, but return warning
      return jsonSuccess({
        deleted,
        warning: ADMIN_API_MESSAGES.IMAGE_CLEANUP_FAILED,
        storageError: storageErr.message,
      })
    }
  }

  return jsonSuccess({ deleted })
}
