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

  return (
    <header className="border-b border-brand-200 bg-header-bg shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap text-brand-accent">
            Propiedades RM
          </Link>

          {/* Hamburger menu button - visible only on mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-brand-100 rounded-lg transition"
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
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-800">
            <Link href="/" className="hover:text-brand-900 transition">
              Inicio
            </Link>

            <Link href="/propiedades" className="hover:text-brand-900 transition">
              Propiedades
            </Link>

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-800 transition"
              >
                Admin
              </Link>
            )}

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
          </nav>
        </div>

        {/* Mobile navigation - visible when menu is open */}
        {isOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-brand-200 space-y-3 text-brand-800 font-medium">
            <Link
              href="/"
              className="block py-2 hover:text-brand-900 transition"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>

            <Link
              href="/propiedades"
              className="block py-2 hover:text-brand-900 transition"
              onClick={() => setIsOpen(false)}
            >
              Propiedades
            </Link>

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="block w-full text-center bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-800 transition"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}

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
          </nav>
        )}
      </div>
    </header>
  )
}
