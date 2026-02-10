export default function Footer() {
  return (
    <footer className="border-t mt-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-600 flex flex-col md:flex-row justify-between gap-4">
        <p>© {new Date().getFullYear()} Propiedades RM. Todos los derechos reservados.</p>

        <div className="flex gap-4">
          <a href="tel:+56900000000" className="hover:underline">
            Teléfono
          </a>
          <a href="https://wa.me/56900000000" target="_blank" className="hover:underline">
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}
