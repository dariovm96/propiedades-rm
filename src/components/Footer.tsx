import { TEL_URL, WHATSAPP_URL } from "@/config/contact"

export default function Footer() {
  return (
    <footer className="border-t mt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-xs sm:text-sm text-gray-600 flex flex-col md:flex-row justify-between gap-4">
        <p>© {new Date().getFullYear()} Propiedades RM. Todos los derechos reservados.</p>

        <div className="flex gap-4">
          <a href={TEL_URL} className="hover:underline">
            Teléfono
          </a>
          <a href={WHATSAPP_URL} target="_blank" className="hover:underline">
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}
