"use client"

import { TEL_URL, WHATSAPP_URL } from "@/config/contact"
import WhatsAppIcon from "@/components/icons/WhatsAppIcon"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-footer-secondary/30 mt-20 bg-footer-bg text-footer-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="text-xs sm:text-sm text-footer-secondary">© {year} Propiedades RM. Todos los derechos reservados.</p>

          <div className="flex gap-6">
            <a
              href={TEL_URL}
              className="flex items-center gap-2 text-footer-primary hover:text-footer-secondary transition"
              title="Llamar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-xs sm:text-sm">Teléfono</span>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              className="flex items-center gap-2 text-footer-primary hover:text-footer-secondary transition"
              title="WhatsApp"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span className="text-xs sm:text-sm">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
