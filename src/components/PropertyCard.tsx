import Link from "next/link"
import { Property } from "@/types/property"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import { PROPERTY_STATUS_BADGE_CLASSES, PROPERTY_STATUS_LABELS } from "@/lib/constants"
import ImageWithLoader from "@/components/ImageWithLoader"

type Props = {
    property: Property
}

export default function PropertyCard({ property }: Props) {
    // 🔥 portada = primera imagen
    const cover =
        property.images?.length
            ? getPublicImageUrl(property.images[0])
            : null

    return (
        <Link
            href={`/propiedades/${property.slug}`}
            className="group h-full flex flex-col border border-brand-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
            {/* Imagen */}
            <div className="relative h-52 bg-brand-100 overflow-hidden">
                {cover ? (
                    <ImageWithLoader
                        src={cover}
                        alt={property.title}
                        wrapperClassName="relative h-full w-full"
                        fill
                        imageClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm text-brand-muted">
                        Sin imagen
                    </div>
                )}
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <div className="space-y-4">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-base sm:text-lg text-brand-900 leading-tight line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem]">
                            {property.title}
                        </h3>

                        <span
                            className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${PROPERTY_STATUS_BADGE_CLASSES[property.status]}`}
                        >
                            {PROPERTY_STATUS_LABELS[property.status]}
                        </span>
                    </div>

                    <p className="text-xs sm:text-sm text-brand-700 line-clamp-1">{property.location_text}</p>

                    <div className="flex justify-between text-xs sm:text-sm font-medium gap-2">
                        <span className="text-brand-700">
                            {property.area_m2 ? `${property.area_m2} m²` : "—"}
                        </span>

                        <span className="text-brand-900">
                            {property.price &&
                                `$${property.price.toLocaleString()}`}
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-4 text-sm text-brand-700 font-medium text-center group-hover:text-brand-900 group-hover:underline underline-offset-2">
                    Ver detalles →
                </div>
            </div>
        </Link>
    )
}
