"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { TEL_URL, WHATSAPP_URL } from "@/config/contact"
import WhatsAppIcon from "@/components/icons/WhatsAppIcon"

export default function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const isHome = pathname === "/"
  const isTransparent = isHome && !hasScrolled && !isOpen

  useEffect(() => {
    const refreshAdminState = async () => {
      try {
        const response = await fetch("/admin/auth", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          setIsAdmin(false)
          return
        }

        const data: { authorized?: boolean } = await response.json().catch(() => ({}))
        setIsAdmin(data.authorized === true)
      } catch {
        setIsAdmin(false)
      }
    }

    void refreshAdminState()
  }, [pathname])

  useEffect(() => {
    if (!isHome) {
      return
    }

    const onScroll = () => {
      setHasScrolled(window.scrollY > 8)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [isHome])

  const headerClasses = isTransparent
    ? "border-transparent bg-transparent shadow-none"
    : "border-b border-brand-200 bg-header-bg/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-header-bg/90"

  const logoClasses = isTransparent
    ? "text-white drop-shadow-sm"
    : "text-brand-accent"

  const menuButtonClasses = isTransparent
    ? "md:hidden rounded-lg p-2 text-white transition hover:bg-white/15"
    : "md:hidden rounded-lg p-2 transition hover:bg-brand-100"

  const desktopNavClasses = isTransparent
    ? "hidden md:flex items-center gap-6 text-sm font-medium text-white"
    : "hidden md:flex items-center gap-6 text-sm font-medium text-brand-800"

  const desktopLinkClasses = isTransparent
    ? "drop-shadow-sm transition hover:text-brand-100"
    : "transition hover:text-brand-900"

  const mobileNavClasses = isTransparent
    ? "md:hidden mt-4 space-y-3 rounded-xl border border-white/20 bg-black/45 p-4 text-white font-medium backdrop-blur-sm"
    : "md:hidden mt-4 pt-4 border-t border-brand-200 space-y-3 text-brand-800 font-medium"

  const mobileLinkClasses = isTransparent
    ? "block py-2 transition hover:text-brand-100"
    : "block py-2 transition hover:text-brand-900"

  const adminIconClasses = isTransparent
    ? "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/40 bg-white/10 text-white transition hover:bg-white/20"
    : "inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white transition hover:bg-brand-800"

  return (
    <header className={`fixed top-0 z-50 w-full transition-colors duration-300 ${headerClasses}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className={`text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap transition-colors ${logoClasses}`}>
            Propiedades RM
          </Link>

          {/* Hamburger menu button - visible only on mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={menuButtonClasses}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop navigation - hidden on mobile */}
          <nav className={desktopNavClasses}>
            <Link href="/" className={desktopLinkClasses}>
              Inicio
            </Link>

            <Link href="/propiedades" className={desktopLinkClasses}>
              Propiedades
            </Link>

            <a
              href={TEL_URL}
              className="inline-flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-800 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Llamar
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp
            </a>

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                aria-label="Panel de administración"
                className={adminIconClasses}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9.01 9.01 0 0112 15a9.01 9.01 0 016.879 2.804M15 8a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile navigation - visible when menu is open */}
        {isOpen && (
          <nav className={mobileNavClasses}>
            <Link
              href="/"
              className={mobileLinkClasses}
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>

            <Link
              href="/propiedades"
              className={mobileLinkClasses}
              onClick={() => setIsOpen(false)}
            >
              Propiedades
            </Link>

            <a
              href={TEL_URL}
              className="inline-flex w-full items-center justify-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-800 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Llamar
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              className="inline-flex w-full items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              <WhatsAppIcon className="w-4 h-4" />
              WhatsApp
            </a>

            {isAdmin && (
              <div className="pt-1 flex justify-center">
                <Link
                  href="/admin/dashboard"
                  aria-label="Panel de administración"
                  className={adminIconClasses}
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9.01 9.01 0 0112 15a9.01 9.01 0 016.879 2.804M15 8a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
