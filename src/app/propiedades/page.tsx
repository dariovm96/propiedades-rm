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

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold">
        Propiedades disponibles
      </h1>

      {properties.length === 0 ? (
        <p className="text-gray-500">
          Aún no hay propiedades publicadas.
        </p>
      ) : (
        <PropertyGrid properties={properties} />
      )}
    </section>
  )
}
