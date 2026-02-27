"use client"

import { useEffect, useState } from "react"
import { TEL_URL, WHATSAPP_URL } from "@/config/contact"

export default function Footer() {
  const [year, setYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    // update on client in case the year changed after SSR
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="border-t mt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <p className="text-xs sm:text-sm text-gray-600">© {year} Propiedades RM. Todos los derechos reservados.</p>

          <div className="flex gap-6">
            <a
              href={TEL_URL}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
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
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              title="WhatsApp"
            >
              <svg className="w-5 h-5" viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M380.9 97.1C339 55.2 284.1 32 228.4 32 102.1 32 0 134.1 0 260.4c0 45.9 12 90.7 34.8 129.9L0 480l94.7-32.6c37.7 20.6 80.2 31.4 123.7 31.4h.1c126.3 0 228.4-102.1 228.4-228.4 0-55.6-22.7-109.6-64.9-151.3zM228.4 419.6c-37.6 0-74.5-10.1-106.4-29l-7.6-4.5-56.4 19.4 18.9-55.1-4.9-8c-20.7-33.8-31.6-73.3-31.6-113.9 0-111.1 90.4-201.4 201.4-201.4 53.8 0 104.3 20.9 142.5 59 38.2 38.2 59 88.7 59 142.5 0 111.1-90.4 201.4-201.4 201.4zm101.2-138.1c-5.6-2.8-33-16.2-38.1-18-5.1-1.8-8.8-2.8-12.5 2.8s-14.3 18-17.5 21.7c-3.2 3.7-6.4 4.2-11.9 1.4-5.6-2.8-23.7-8.7-45.2-27.9-16.7-14.9-28-33.3-31.3-38.9-3.2-5.6-.3-8.6 2.5-11.4 2.6-2.6 5.6-6.7 8.4-10 2.8-3.2 3.7-5.6 5.6-9.4.8-1.8.4-3.7-.2-5.6s-12.5-30.1-17.1-41.5c-4.5-10.9-9.1-9.4-12.5-9.6-3.2-.2-6.9-.2-10.6-.2s-5.6.8-8.6 3.7c-3 2.8-11.4 11.1-11.4 27.1s11.7 31.5 13.3 33.7c1.8 2.8 23 35.2 55.8 49.1 7.8 3.4 13.5 5.4 18.1 6.9 7.6 2.3 14.5 2 20 1.2 6.1-.9 33.3-13.6 38-15.1 4.7-1.4 8.9-1.4 12.2-.8 3.7.6 11.5 4.6 13.2 9.1 1.8 4.5 1.8 8.3 1.2 9.1-.6.8-2.4 2.8-5 4.5z"/>
              </svg>
              <span className="text-xs sm:text-sm">WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
