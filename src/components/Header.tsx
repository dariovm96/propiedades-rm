"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { CONTACT_PHONE_DISPLAY, TEL_URL, WHATSAPP_URL } from "@/config/contact"
import ContactActionButton from "@/components/ContactActionButton"

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
    : "border-b border-[#10324D] bg-[#081F32]/92 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-[#081F32]/88"

  const logoClasses = isTransparent
    ? "bg-gradient-to-r from-white to-brand-client-300 bg-clip-text text-transparent"
    : "bg-gradient-to-r from-white to-brand-client-300 bg-clip-text text-transparent"

  const menuButtonClasses = isTransparent
    ? "md:hidden rounded-lg p-2 text-white transition hover:bg-white/15"
    : "md:hidden rounded-lg p-2 text-white transition hover:bg-white/15"

  const desktopNavClasses = isTransparent
    ? "hidden md:flex items-center gap-6 text-sm font-medium text-white"
    : "hidden md:flex items-center gap-6 text-sm font-semibold text-slate-100"

  const desktopLinkClasses = isTransparent
    ? "drop-shadow-sm transition hover:text-sky-200"
    : "transition hover:text-sky-200"

  const mobileNavClasses = isTransparent
    ? "md:hidden mt-4 space-y-3 rounded-xl border border-white/20 bg-black/45 p-4 text-white font-medium backdrop-blur-sm"
    : "md:hidden mt-4 pt-4 border-t border-white/20 space-y-3 text-white font-semibold"

  const mobileLinkClasses = isTransparent
    ? "block py-2 text-white transition hover:text-sky-200"
    : "block py-2 text-white transition hover:text-sky-200"

  const phoneHeaderButtonClasses = "px-4 py-2 rounded-lg"

  const whatsappHeaderButtonClasses = "px-4 py-2 rounded-lg"

  const mobilePhoneHeaderButtonClasses = "w-full px-4 py-2 rounded-lg"

  const mobileWhatsappHeaderButtonClasses = "w-full px-4 py-2 rounded-lg"

  const adminIconClasses =
    "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-3 text-white transition hover:bg-white/20"

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

            <ContactActionButton
              href={TEL_URL}
              variant="phone"
              label="Llamar"
              desktopLabel={CONTACT_PHONE_DISPLAY}
              aria-label={`Llamar al ${CONTACT_PHONE_DISPLAY}`}
              className={phoneHeaderButtonClasses}
              iconClassName="w-4 h-4"
            />

            <ContactActionButton
              href={WHATSAPP_URL}
              variant="whatsapp"
              label="WhatsApp"
              target="_blank"
              className={whatsappHeaderButtonClasses}
              iconClassName="w-4 h-4"
            />

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                aria-label="Panel de administración"
                className={adminIconClasses}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9.01 9.01 0 0112 15a9.01 9.01 0 016.879 2.804M15 8a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-semibold">Panel</span>
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

            <ContactActionButton
              href={TEL_URL}
              variant="phone"
              label="Llamar"
              className={mobilePhoneHeaderButtonClasses}
              iconClassName="w-4 h-4"
              aria-label={`Llamar al ${CONTACT_PHONE_DISPLAY}`}
            />

            <ContactActionButton
              href={WHATSAPP_URL}
              variant="whatsapp"
              label="WhatsApp"
              target="_blank"
              className={mobileWhatsappHeaderButtonClasses}
              iconClassName="w-4 h-4"
            />

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
                  <span className="text-sm font-semibold">Panel</span>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
