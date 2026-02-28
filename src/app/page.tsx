import { TEL_URL, WHATSAPP_URL } from "@/config/contact"

export default function Home() {
  return (
    <section className="space-y-10">
      <div className="text-center py-12 sm:py-20">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4">
          Encuentre su próxima propiedad
        </h1>

        <p className="text-sm sm:text-base text-brand-700 mb-6 sm:mb-8">
          Compra y arriendo directo con el dueño, sin intermediarios.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <a
            href={TEL_URL}
            className="bg-brand-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-brand-800 transition text-sm sm:text-base"
          >
            Llamar ahora
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-brand-300 text-brand-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-brand-100 transition text-sm sm:text-base"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
