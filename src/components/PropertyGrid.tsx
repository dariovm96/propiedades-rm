import { Property } from "@/types/property"
import PropertyCard from "./PropertyCard"

type Props = {
  properties: Array<Property & { highlights?: string[] }>
}

export default function PropertyGrid({ properties }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
