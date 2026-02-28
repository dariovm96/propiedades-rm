import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAllowedAdminEmails } from "@/lib/admin-auth"

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()
  const isAdminAuthRoute = req.nextUrl.pathname === "/admin/auth"

  if (isAdminAuthRoute) {
    return res
  }

  const allowedAdminEmails = getAllowedAdminEmails()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isLoginPage = req.nextUrl.pathname === "/admin/login"

  // 🔐 Proteger admin excepto login
  if ((!user || userError) && isAdminRoute && !isLoginPage && !isAdminAuthRoute) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  if (user && isAdminRoute && !isLoginPage && !isAdminAuthRoute) {
    const sessionEmail = user.email?.trim().toLowerCase()

    if (
      allowedAdminEmails.length === 0 ||
      !sessionEmail ||
      !allowedAdminEmails.includes(sessionEmail)
    ) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*"],
}
