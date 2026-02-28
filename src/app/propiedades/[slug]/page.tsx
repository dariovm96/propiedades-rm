export const revalidate = 60 // cache property detail for one minute

import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Property } from "@/types/property"
import PropertyGallery from "@/components/PropertyGallery"
import { CONTACT_PHONE } from "@/config/contact"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import { PROPERTY_STATUS_BADGE_CLASSES, PROPERTY_STATUS_LABELS } from "@/lib/constants"

type Props = {
    params: Promise<{
        slug: string
    }>
}

export default async function PropertyDetailPage({ params }: Props) {
    // ✅ Next 15: params es async
    const { slug } = await params

    /* ==============================
       1. Obtener propiedad
    ============================== */
    const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("slug", slug)
        .single()

    if (error || !data) {
        notFound()
    }

    const property = data as Property

    /* ==============================
       2. Obtener imágenes desde Storage
       bucket: property-images/{slug}/
    ============================== */
    const imageUrls =
        property.images?.map((path) => getPublicImageUrl(path)) || []

     /* ==============================
         3. Render
     ============================== */
    return (
        <section className="space-y-8 sm:space-y-10">

            {/* 🔥 Galería real */}
            <PropertyGallery images={imageUrls} />

            {/* Header info */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                        {property.title}
                    </h1>

                    <p className="text-sm sm:text-base text-brand-700 mb-3">
                        {property.location_text}
                    </p>

                    <span
                        className={`inline-block text-xs sm:text-sm px-3 py-1 rounded ${PROPERTY_STATUS_BADGE_CLASSES[property.status]}`}
                    >
                        {PROPERTY_STATUS_LABELS[property.status]}
                    </span>
                </div>

                <div className="md:text-right space-y-2 text-sm sm:text-base">
                    {property.price && (
                        <p className="text-xl sm:text-2xl font-semibold">
                            ${property.price.toLocaleString()}
                        </p>
                    )}

                    {property.area_m2 && (
                        <p className="text-brand-700">
                            {property.area_m2} m²
                        </p>
                    )}
                </div>
            </div>

            {/* Descripción */}
            {property.description && (
                <div className="prose max-w-none">
                    <h2 className="text-lg sm:text-xl font-semibold mb-3">
                        Descripción
                    </h2>

                    <p className="text-sm sm:text-base text-brand-700 whitespace-pre-line">
                        {property.description}
                    </p>
                </div>
            )}

            {/* Contacto (CTA principal del negocio) */}
            <div className="border border-brand-200 rounded-xl p-4 sm:p-6 bg-brand-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                    href={`tel:${property.contact_phone || CONTACT_PHONE}`}
                    className="flex-1 text-center bg-brand-700 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-brand-800 transition text-sm sm:text-base"
                >
                    📞 Llamar ahora
                </a>

                <a
                    href={`https://wa.me/${property.contact_phone || CONTACT_PHONE}`}
                    target="_blank"
                    className="flex-1 text-center border border-brand-300 text-brand-700 py-2 sm:py-3 rounded-lg font-medium hover:bg-brand-100 transition text-sm sm:text-base"
                >
                    💬 WhatsApp
                </a>
            </div>
        </section>
    )
}
