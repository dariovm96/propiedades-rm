import Link from "next/link"
import { Property } from "@/types/property"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import { PROPERTY_STATUS_BADGE_CLASSES, PROPERTY_STATUS_LABELS } from "@/lib/constants"
import ImageWithLoader from "@/components/ImageWithLoader"

type Props = {
    property: Property & { highlights?: string[] }
}

export default function PropertyCard({ property }: Props) {
    // 🔥 portada = primera imagen
    const cover =
        property.images?.length
            ? getPublicImageUrl(property.images[0])
            : null
    const catalogHighlights = property.highlights?.slice(0, 3) ?? []
    const remainingHighlights = Math.max((property.highlights?.length ?? 0) - catalogHighlights.length, 0)

    return (
        <Link
            href={`/propiedades/${property.slug}`}
            className="group h-full flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-0 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
            {/* Imagen */}
            <div className="relative h-52 overflow-hidden bg-brand-100">
                {cover ? (
                    <ImageWithLoader
                        src={cover}
                        alt={property.title}
                        wrapperClassName="relative h-full w-full"
                        fill
                        imageClassName="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm text-content-secondary">
                        Sin imagen
                    </div>
                )}

            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-2xl font-bold tracking-tight text-content-primary">
                            {property.price ? `$${property.price.toLocaleString()}` : "Precio a consultar"}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PROPERTY_STATUS_BADGE_CLASSES[property.status]}`}>
                            {PROPERTY_STATUS_LABELS[property.status]}
                        </span>
                    </div>

                    <h3 className="line-clamp-2 min-h-[2.8rem] text-base font-semibold leading-tight text-content-primary sm:text-lg">
                        {property.title}
                    </h3>

                    <div className="flex items-center justify-between gap-3 text-xs text-content-secondary sm:text-sm">
                        <p className="line-clamp-1 min-w-0">
                            {property.location_text || "Ubicación por confirmar"}
                        </p>
                        {property.area_m2 && (
                            <span className="shrink-0 font-medium text-content-primary">
                                {property.area_m2} m²
                            </span>
                        )}
                    </div>

                    <div className="min-h-[3.25rem] border-t border-border-subtle pt-3">
                        {catalogHighlights.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {catalogHighlights.map((highlight, index) => (
                                    <span
                                        key={`${highlight}-${index}`}
                                        className="line-clamp-1 rounded-full border border-border-subtle bg-surface-1 px-2.5 py-1 text-[11px] text-content-secondary sm:text-xs"
                                    >
                                        {highlight}
                                    </span>
                                ))}
                                {remainingHighlights > 0 && (
                                    <span className="rounded-full border border-border-subtle bg-surface-1 px-2.5 py-1 text-[11px] text-content-secondary sm:text-xs">
                                        +{remainingHighlights} más
                                    </span>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="mt-auto pt-4 text-center text-sm font-medium text-content-secondary underline-offset-2 group-hover:text-content-primary group-hover:underline">
                    Ver detalles →
                </div>
            </div>
        </Link>
    )
}
