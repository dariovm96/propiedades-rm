export default function Home() {
  return (
    <section className="space-y-10">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">
          Encuentre su próxima propiedad
        </h1>

        <p className="text-gray-600 mb-8">
          Compra y arriendo directo con el dueño, sin intermediarios.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="tel:+56900000000"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg"
          >
            Llamar ahora
          </a>

          <a
            href="https://wa.me/56900000000"
            className="border px-6 py-3 rounded-lg"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
