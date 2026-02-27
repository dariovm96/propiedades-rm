import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { STORAGE_BUCKETS } from "@/lib/constants"

import { cookies as getCookies } from "next/headers"

export async function DELETE(
  req: NextRequest,
  ctx: { params: { id: string } | Promise<{ id: string }> }
) {
  // unwrap params if it's a promise
  const { id } = (await ctx.params) as { id: string }
  // perform deletion for given property id
  const cookieStore = await getCookies()

  // create a cookie methods object to satisfy supabase client requirements
  const cookieMethods = {
    // read
    get: (name: string) => {
      const c = cookieStore.get(name)
      return c ? c.value : undefined
    },
    getAll: () => cookieStore.getAll().map((c: any) => ({ name: c.name, value: c.value })),

    // write stubs (not needed for authentication check)
    set: (_name: string, _value: string, _options?: any) => {},
    remove: (_name: string) => {},
    setAll: (_cookies: any[]) => {},
    deleteAll: () => {},
  }

  // verify session using server client and cookies
  const serverSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: cookieMethods }
  )

  const {
    data: { session },
  } = await serverSupabase.auth.getSession()

  if (!session) {
    // for API/fetch calls return JSON + 401 instead of redirecting to a page
    // (redirects are followed by fetch and may return 200 HTML which hides auth failures)
    // serialize cookies into plain objects to avoid serializing complex objects
    const safeCookies = cookieStore.getAll().map((c: any) => ({
      name: c.name,
      value: typeof c.value === "string" ? c.value : String(c.value),
      path: c.path || null,
    }))
    const debugInfo = {
      cookies: safeCookies,
      requestUrl: req.url,
      headers: Object.fromEntries(req.headers.entries()),
    }
    try {
      return NextResponse.json({ error: "no session", debug: debugInfo }, { status: 401 })
    } catch (err) {
      console.error("failed to serialize debug info", err)
      return NextResponse.json({ error: "no session" }, { status: 401 })
    }
  }

  // perform deletion with service role key to bypass RLS
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "server misconfiguration" }, { status: 500 })
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
      return NextResponse.json({ error: "property not found" }, { status: 404 })
    }
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const imagesToRemove: string[] = propertyData?.images || []

  // now delete the row
  const { data: deleted, error } = await adminSupabase
    .from("properties")
    .delete()
    .select("id")
    .eq("id", id)


  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json({ error: "no rows deleted" }, { status: 404 })
  }

  // attempt to remove related images
  if (imagesToRemove.length > 0) {
    const { error: storageErr } = await adminSupabase.storage
      .from(STORAGE_BUCKETS.PROPERTY_IMAGES)
      .remove(imagesToRemove)

    if (storageErr) {
      // we don't fail the whole request, but return warning
      return NextResponse.json({
        success: true,
        deleted,
        warning: "image cleanup failed",
        storageError: storageErr.message,
      })
    }
  }

  return NextResponse.json({ success: true, deleted })
}
