export const revalidate = 60 // cache property detail for one minute

import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Property } from "@/types/property"
import PropertyGallery from "@/components/PropertyGallery"
import ContactActionButton from "@/components/ContactActionButton"
import { ATTENTION_HOURS_LABEL, CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/config/contact"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import { PROPERTY_STATUS_BADGE_CLASSES, PROPERTY_STATUS_LABELS } from "@/lib/constants"
import Link from "next/link"
import { PropertyHighlight } from "@/types/property-highlight"
import PropertyDetailTabs from "@/components/PropertyDetailTabs"

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
        .returns<Property[]>()
        .single()

    if (error || !data) {
        notFound()
    }

    const property = data

    const { data: highlightsData } = await supabase
        .from("property_highlights")
        .select("*")
        .eq("property_id", property.id)
        .returns<PropertyHighlight[]>()

    const highlights = highlightsData ?? []
    const highlightTexts = highlights
        .map((item) => {
            const candidate =
                item.highlight || item.text || item.title || item.label || item.name || item.value || item.description
            return typeof candidate === "string" ? candidate.trim() : ""
        })
        .filter((text): text is string => text.length > 0)

    /* ==============================
       2. Obtener imágenes desde Storage
       bucket: property-images/{slug}/
    ============================== */
    const imageUrls =
        property.images?.map((path) => getPublicImageUrl(path)) || []

    const contactPhone = property.contact_phone || CONTACT_PHONE
    const normalizedPhone = contactPhone.replace(/\s+/g, "")
    const phoneWithPrefix = normalizedPhone.startsWith("+") ? normalizedPhone : `+${normalizedPhone}`
    const whatsappPhone = normalizedPhone.replace(/^\+/, "")
    const contactPhoneDisplay = contactPhone === CONTACT_PHONE ? CONTACT_PHONE_DISPLAY : phoneWithPrefix
    const formattedPrice = property.price ? `$${property.price.toLocaleString()}` : "Precio a consultar"
    const areaLabel = property.area_m2 ? `${property.area_m2} m²` : "Superficie por confirmar"

     /* ==============================
         3. Render
     ============================== */
    return (
        <section className="max-w-full space-y-10 pt-8 sm:space-y-12 sm:pt-10">
            <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-content-secondary sm:text-sm">
                <Link href="/" className="hover:text-content-primary transition">Inicio</Link>
                <span>/</span>
                <Link href="/propiedades" className="hover:text-content-primary transition">Propiedades</Link>
                <span>/</span>
                <span className="break-words font-medium text-content-primary">{property.title}</span>
            </nav>

            <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
                <div className="order-1 min-w-0 lg:order-2">
                    <PropertyGallery images={imageUrls} />
                </div>

                <header className="order-2 flex min-w-0 flex-col gap-6 rounded-2xl border border-[#90AFDF] bg-[linear-gradient(180deg,#95B5E8_0%,#B7CCEF_18%,#DCE8FB_34%,#EEF4FF_50%,#DCE8FB_66%,#B7CCEF_82%,#95B5E8_100%)] p-4 shadow-md sm:gap-7 sm:p-6 lg:order-1 lg:h-full max-md:dark:border-border-subtle max-md:dark:bg-none max-md:dark:bg-surface-1">
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs sm:text-sm ${PROPERTY_STATUS_BADGE_CLASSES[property.status]}`}>
                            {PROPERTY_STATUS_LABELS[property.status]}
                        </span>
                        <span className="inline-block rounded-full border border-white/80 bg-white/85 px-3 py-1 text-xs font-medium text-slate-700 sm:text-sm max-md:dark:border-slate-700 max-md:dark:bg-slate-800 max-md:dark:text-slate-200">
                            Entrega inmediata
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h1 className="break-words text-2xl font-bold leading-tight text-[#0B2540] sm:text-4xl max-md:dark:text-slate-100">
                            {property.title}
                        </h1>
                        <p className="text-sm font-medium text-slate-700 sm:text-base max-md:dark:text-slate-300">
                            {property.location_text || "Ubicacion por confirmar"}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:mt-auto">
                        <article className="rounded-xl border border-white/70 bg-white/65 p-4 backdrop-blur-[1px] max-md:dark:border-slate-700 max-md:dark:bg-slate-900/80">
                            <p className="text-xs uppercase tracking-wide text-slate-600 max-md:dark:text-slate-300">Precio</p>
                            <p className="mt-1 break-words text-xl font-semibold text-[#1E3A5F] sm:text-2xl max-md:dark:text-sky-200">{formattedPrice}</p>
                        </article>

                        <article className="rounded-xl border border-white/70 bg-white/65 p-4 backdrop-blur-[1px] max-md:dark:border-slate-700 max-md:dark:bg-slate-900/80">
                            <p className="text-xs uppercase tracking-wide text-slate-600 max-md:dark:text-slate-300">Superficie</p>
                            <p className="mt-1 break-words text-xl font-semibold text-slate-900 sm:text-2xl max-md:dark:text-slate-100">{areaLabel}</p>
                        </article>
                    </div>

                </header>
            </section>

            <PropertyDetailTabs
                description={property.description}
                highlights={highlightTexts}
                locationText={property.location_text}
            />

            <section className="rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-0 to-surface-1/70 p-4 shadow-sm sm:p-6">
                <div className="mb-6 text-center sm:mb-7">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-content-secondary sm:text-base">
                        Contacto prioritario
                    </p>
                    <p className="mt-2 text-xs text-content-secondary sm:text-sm">
                        {ATTENTION_HOURS_LABEL}
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <ContactActionButton
                        href={`tel:${phoneWithPrefix}`}
                        variant="phone"
                        label="Llamar ahora"
                        desktopLabel={contactPhoneDisplay}
                        aria-label={`Llamar al ${contactPhoneDisplay}`}
                        className="flex-1 min-h-12 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:text-base"
                        iconClassName="h-4 w-4"
                    />

                    <ContactActionButton
                        href={`https://wa.me/${whatsappPhone}`}
                        variant="whatsapp"
                        label="Contactar por WhatsApp"
                        target="_blank"
                        className="flex-1 min-h-12 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:text-base"
                        iconClassName="h-4 w-4"
                    />
                </div>
            </section>
        </section>
    )
}
