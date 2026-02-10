import Link from "next/link"

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Propiedades RM
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-gray-600">
            Inicio
          </Link>

          <Link href="/propiedades" className="hover:text-gray-600">
            Propiedades
          </Link>

          <a
            href="tel:+56900000000"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Llamar
          </a>

          <a
            href="https://wa.me/56900000000"
            target="_blank"
            className="border px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
