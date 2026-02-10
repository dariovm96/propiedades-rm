import Link from "next/link"
import Image from "next/image"
import { Property } from "@/types/property"

type Props = {
    property: Property
}

export default function PropertyCard({ property }: Props) {
    const statusColor = {
        available: "bg-green-100 text-green-700",
        sold: "bg-red-100 text-red-700",
        rented: "bg-yellow-100 text-yellow-700",
    }

    // 🔥 portada = primera imagen
    const cover =
        property.images?.length
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${property.images[0]}`
            : null

    return (
        <Link
            href={`/propiedades/${property.slug}`}
            className="border rounded-xl overflow-hidden hover:shadow-lg transition bg-white"
        >
            {/* Imagen */}
            <div className="relative h-48 bg-gray-200">
                {cover ? (
                    <Image
                        src={cover}
                        alt={property.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                        Sin imagen
                    </div>
                )}
            </div>

            <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{property.title}</h3>

                    <span
                        className={`text-xs px-2 py-1 rounded ${statusColor[property.status]}`}
                    >
                        {property.status}
                    </span>
                </div>

                <p className="text-sm text-gray-600">{property.location_text}</p>

                <div className="flex justify-between text-sm font-medium">
                    <span>
                        {property.area_m2 && `${property.area_m2} m²`}
                    </span>

                    <span>
                        {property.price &&
                            `${property.currency} ${property.price.toLocaleString()}`}
                    </span>
                </div>

                <div className="pt-2 text-sm text-gray-900 font-medium">
                    Ver detalles →
                </div>
            </div>
        </Link>
    )
}
