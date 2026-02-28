export const revalidate = 60 // cache propiedades list for one minute

import { supabase } from "@/lib/supabase"
import PropertyGrid from "@/components/PropertyGrid"
import { Property } from "@/types/property"

export default async function PropiedadesPage() {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return <p>Error cargando propiedades</p>
  }

  const properties = (data || []) as Property[]
  const totalProperties = properties.length

  return (
    <section className="space-y-8 sm:space-y-10">
      <div className="rounded-2xl border border-brand-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs sm:text-sm font-medium text-brand-700">
            Catálogo de propiedades
          </span>

          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-brand-900">
            Encuentra tu próxima propiedad
          </h1>

          <p className="text-sm sm:text-base text-brand-700 max-w-2xl">
            Explora nuestra selección de propiedades disponibles con información clara,
            fotografías y detalles relevantes para ayudarte a tomar una mejor decisión.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-100 px-4 py-2 text-sm font-medium text-brand-700">
          <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          {totalProperties} {totalProperties === 1 ? "propiedad publicada" : "propiedades publicadas"}
        </div>
      </div>

      {totalProperties === 0 ? (
        <div className="rounded-2xl border border-brand-300 border-dashed bg-white p-8 sm:p-10 text-center">
          <p className="text-brand-muted text-sm sm:text-base">
            Aún no hay propiedades publicadas.
          </p>
        </div>
      ) : (
        <PropertyGrid properties={properties} />
      )}
    </section>
  )
}
