"use client"

import Link from "next/link"
import { useState } from "react"
import { TEL_URL, WHATSAPP_URL } from "@/config/contact"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap">
            Propiedades RM
          </Link>

          {/* Hamburger menu button - visible only on mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
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
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-gray-600 transition">
              Inicio
            </Link>

            <Link href="/propiedades" className="hover:text-gray-600 transition">
              Propiedades
            </Link>

            <a
              href={TEL_URL}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Llamar
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              WhatsApp
            </a>
          </nav>
        </div>

        {/* Mobile navigation - visible when menu is open */}
        {isOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t space-y-3">
            <Link
              href="/"
              className="block py-2 hover:text-gray-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Inicio
            </Link>

            <Link
              href="/propiedades"
              className="block py-2 hover:text-gray-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Propiedades
            </Link>

            <a
              href={TEL_URL}
              className="block w-full text-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Llamar
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              className="block w-full text-center border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              WhatsApp
            </a>
          </nav>
        )}
      </div>
    </header>
  )
}
