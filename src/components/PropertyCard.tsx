import Link from "next/link"
import { Property } from "@/types/property"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import { getLocationDisplay } from "@/lib/location-helpers"
import { PROPERTY_STATUS_BADGE_CLASSES, PROPERTY_STATUS_LABELS } from "@/lib/constants"
import ImageWithLoader from "@/components/ImageWithLoader"

type Props = {
    property: Property & { highlights?: string[] }
}

export default function PropertyCard({ property }: Props) {
    const cover =
        property.images?.length
            ? getPublicImageUrl(property.images[0])
            : null
    const catalogHighlights = property.highlights?.slice(0, 3) ?? []
    const remainingHighlights = Math.max((property.highlights?.length ?? 0) - catalogHighlights.length, 0)

    return (
        <Link
            href={`/propiedades/${property.slug}`}
            className="group card-hover relative flex h-full flex-col overflow-hidden rounded-2xl bg-surface-1 shadow-card border-l-[3px] border-brand-client-400"
        >
            <div className="relative h-56 overflow-hidden bg-neutral-200">
                {cover ? (
                    <>
                        <ImageWithLoader
                            src={cover}
                            alt={property.title}
                            wrapperClassName="relative h-full w-full"
                            fill
                            imageClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 via-transparent to-transparent" />
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-400">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                )}
                
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${PROPERTY_STATUS_BADGE_CLASSES[property.status]}`}>
                    {PROPERTY_STATUS_LABELS[property.status]}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <span className="text-xl font-semibold tracking-tight text-content-primary font-display">
                            {property.price ? `$${property.price.toLocaleString()}` : "Precio a consultar"}
                        </span>
                    </div>

                    <h3 className="line-clamp-2 text-base font-medium leading-snug text-content-primary">
                        {property.title}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-content-secondary">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <p className="line-clamp-1 min-w-0">
                            {getLocationDisplay(property) || "Ubicación por confirmar"}
                        </p>
                        {property.area_m2 && (
                            <>
                                <span className="text-neutral-300">•</span>
                                <span className="shrink-0 font-medium text-content-primary">
                                    {property.area_m2} m²
                                </span>
                            </>
                        )}
                    </div>

                    {catalogHighlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {catalogHighlights.map((highlight, index) => (
                                <span
                                    key={`${highlight}-${index}`}
                                    className="line-clamp-1 rounded-md bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
                                >
                                    {highlight}
                                </span>
                            ))}
                            {remainingHighlights > 0 && (
                                <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500">
                                    +{remainingHighlights}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-3 text-sm font-medium text-neutral-500 transition-colors group-hover:text-brand-client-600">
                    <span>Ver detalles</span>
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>
        </Link>
    )
}
