export const revalidate = 60 // cache property detail for one minute

import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Property } from "@/types/property"
import PropertyGallery from "@/components/PropertyGallery"
import ContactActionButton from "@/components/ContactActionButton"
import { CONTACT_PHONE, CONTACT_PHONE_DISPLAY } from "@/config/contact"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import { PROPERTY_STATUS_BADGE_CLASSES, PROPERTY_STATUS_LABELS } from "@/lib/constants"
import Link from "next/link"
import { PropertyHighlight } from "@/types/property-highlight"

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
        .returns<Property[]>()
        .eq("slug", slug)
        .single()

    if (error || !data) {
        notFound()
    }

    const property = data

    const { data: highlightsData } = await supabase
        .from("property_highlights")
        .select("*")
        .returns<PropertyHighlight[]>()
        .eq("property_id", property.id)

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

     /* ==============================
         3. Render
     ============================== */
    return (
        <section className="space-y-10 pt-8 sm:space-y-12 sm:pt-10">
            <nav className="text-xs text-content-secondary sm:text-sm">
                <Link href="/" className="hover:text-content-primary transition">Inicio</Link>
                <span className="mx-2">/</span>
                <Link href="/propiedades" className="hover:text-content-primary transition">Propiedades</Link>
                <span className="mx-2">/</span>
                <span className="text-content-primary font-medium">{property.title}</span>
            </nav>

            <PropertyGallery images={imageUrls} />

            <header className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
                <div className="space-y-4">
                    <span
                        className={`inline-block rounded-full px-3 py-1 text-xs sm:text-sm ${PROPERTY_STATUS_BADGE_CLASSES[property.status]}`}
                    >
                        {PROPERTY_STATUS_LABELS[property.status]}
                    </span>

                    <h1 className="text-3xl font-bold leading-tight text-content-primary sm:text-4xl">
                        {property.title}
                    </h1>

                    <p className="text-sm text-content-secondary sm:text-base">
                        {property.location_text}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {property.area_m2 && (
                            <span className="rounded-full border border-border-subtle bg-surface-1 px-3 py-1 text-xs font-medium text-content-secondary sm:text-sm">
                                {property.area_m2} m²
                            </span>
                        )}
                        <span className="rounded-full border border-border-subtle bg-surface-1 px-3 py-1 text-xs font-medium text-content-secondary sm:text-sm">
                            Publicación verificada
                        </span>
                    </div>
                </div>

                <aside className="rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-1 to-surface-0 p-4 shadow-sm sm:p-5 lg:min-w-[280px]">
                    <p className="text-xs font-medium uppercase tracking-wide text-content-secondary">Precio de publicación</p>
                    <p className="mt-1 text-2xl font-semibold text-brand-700 sm:text-3xl">
                        {formattedPrice}
                    </p>
                    {property.area_m2 && (
                        <p className="mt-2 text-sm text-content-secondary">{property.area_m2} m² construidos</p>
                    )}
                </aside>
            </header>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-xl border border-border-subtle bg-surface-0 p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-content-secondary">Estado</p>
                    <p className="mt-1 text-sm font-semibold text-content-primary">{PROPERTY_STATUS_LABELS[property.status]}</p>
                </article>
                <article className="rounded-xl border border-border-subtle bg-surface-0 p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-content-secondary">Superficie</p>
                    <p className="mt-1 text-sm font-semibold text-content-primary">{property.area_m2 ? `${property.area_m2} m²` : "No informada"}</p>
                </article>
                <article className="rounded-xl border border-border-subtle bg-surface-0 p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-content-secondary">Precio</p>
                    <p className="mt-1 text-sm font-semibold text-content-primary">{formattedPrice}</p>
                </article>
                <article className="rounded-xl border border-border-subtle bg-surface-0 p-4 text-center">
                    <p className="text-xs uppercase tracking-wide text-content-secondary">Contacto</p>
                    <p className="mt-1 text-sm font-semibold text-content-primary">{contactPhoneDisplay}</p>
                </article>
            </section>

            <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
                {property.description && (
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-content-primary sm:text-xl">
                            Descripción
                        </h2>

                        <p className="max-w-4xl whitespace-pre-line text-sm leading-relaxed text-content-secondary sm:text-base">
                            {property.description}
                        </p>
                    </section>
                )}

                {highlightTexts.length > 0 && (
                    <aside className="space-y-3">
                        <h2 className="text-lg font-semibold text-content-primary sm:text-xl">Detalles clave</h2>
                        <div className="space-y-2">
                            {highlightTexts.map((highlight, index) => (
                                <div key={`${highlight}-${index}`} className="rounded-lg border border-border-subtle bg-surface-0 px-4 py-3 text-sm text-content-secondary">
                                    {highlight}
                                </div>
                            ))}
                        </div>
                    </aside>
                )}
            </section>

            <section className="rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-0 to-surface-1/70 p-4 shadow-sm sm:p-6">
                <div className="mb-4 space-y-1 text-center sm:text-left">
                    <p className="text-xs font-medium uppercase tracking-wide text-content-secondary">
                        Contacto prioritario
                    </p>
                    <p className="text-base font-semibold text-content-primary sm:text-lg">{contactPhoneDisplay}</p>
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
