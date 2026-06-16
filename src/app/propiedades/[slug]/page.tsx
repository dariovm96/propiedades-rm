export const revalidate = 60 // cache property detail for one minute

import { Metadata } from "next"
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

/* ==============================
   0. Data fetcher (shared)
============================== */
async function getPropertyBySlug(slug: string): Promise<Property | null> {
    const { data: rawProperty, error } = await supabase
        .from("properties")
        .select("*")
        .eq("slug", slug)
        .single()

    if (error || !rawProperty) {
        return null
    }

    return rawProperty as Property
}

/* ==============================
   1. Dynamic metadata
============================== */
function inferPropertyType(title: string): string {
    const lower = title.toLowerCase()
    if (lower.includes("terreno") || lower.includes("parcela") || lower.includes("lote")) return "Terreno"
    if (lower.includes("casa") || lower.includes("hogar") || lower.includes("residencial")) return "Casa"
    if (lower.includes("departamento") || lower.includes("apartamento") || lower.includes("flat")) return "Departamento"
    if (lower.includes("oficina") || lower.includes("comercial")) return "Oficina"
    return "Propiedad"
}

function getStatusLabel(status: Property["status"]): string {
    switch (status) {
        case "available": return "en venta/arriendo"
        case "sold": return "vendida"
        case "rented": return "arrendada"
        default: return "en venta/arriendo"
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const property = await getPropertyBySlug(slug)

    if (!property) {
        return {
            title: "Propiedad no encontrada | Propiedades RM",
            description: "La propiedad que buscas no está disponible. Explora otras opciones en Propiedades RM.",
        }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"
    const propertyType = inferPropertyType(property.title)
    const areaLabel = property.area_m2 ? `${property.area_m2} m²` : null
    const statusLabel = getStatusLabel(property.status)
    const city = property.location_text || "Melipilla"

    const titleParts = [propertyType]
    if (areaLabel) titleParts.push(areaLabel)
    titleParts.push(`${statusLabel} en ${city}`)
    titleParts.push("| Propiedades RM")
    const title = titleParts.join(" ")

    const descriptionParts: string[] = []
    if (property.description) descriptionParts.push(property.description)
    descriptionParts.push(property.title)
    if (property.price) descriptionParts.push(`Precio: $${property.price.toLocaleString()} CLP.`)
    if (property.area_m2) descriptionParts.push(`Superficie: ${property.area_m2} m².`)
    if (property.location_text) descriptionParts.push(`Ubicación: ${property.location_text}.`)
    descriptionParts.push("Encuentra propiedades verificadas en Propiedades RM.")
    const description = descriptionParts.join(" ")

    const openGraphImages = property.images?.[0]
        ? [{ url: getPublicImageUrl(property.images[0]), alt: property.title }]
        : undefined

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            images: openGraphImages,
        },
        alternates: {
            canonical: `${siteUrl}/propiedades/${slug}`,
        },
    }
}

export default async function PropertyDetailPage({ params }: Props) {
    // ✅ Next 15: params es async
    const { slug } = await params

    /* ==============================
       1. Obtener propiedad
    ============================== */
    const property = await getPropertyBySlug(slug)

    if (!property) {
        notFound()
    }

    const { data: highlightsData } = await supabase
        .from("property_highlights")
        .select("*")
        .eq("property_id", property.id)
        .overrideTypes<PropertyHighlight[], { merge: false }>()

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
/* ==============================
   5. JSON-LD Schema.org
============================== */
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000"
    const propertyUrl = `${siteUrl}/propiedades/${slug}`

    const schemaImages = property.images?.length
        ? property.images.map((path) => getPublicImageUrl(path))
        : undefined

    const jsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: property.title,
        description: property.description || property.title,
        url: propertyUrl,
    }

    if (property.price != null) {
        jsonLd.price = `${property.price.toLocaleString()} CLP`
    }

    if (property.area_m2 != null) {
        jsonLd.floorSize = {
            "@type": "QuantitativeValue",
            value: property.area_m2,
            unitCode: "MTK",
        }
    }

    if (property.location_text) {
        jsonLd.address = {
            "@type": "PostalAddress",
            addressLocality: property.location_text,
            addressCountry: "CL",
        }
    }

    if (schemaImages) {
        jsonLd.image = schemaImages
    }

    if (property.lat != null && property.lng != null) {
        jsonLd.geo = {
            "@type": "GeoCoordinates",
            latitude: property.lat,
            longitude: property.lng,
        }
    }

    return (
        <section className="max-w-full space-y-10 pt-8 sm:space-y-12 sm:pt-10">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
                <Link href="/" className="transition hover:text-neutral-800">Inicio</Link>
                <span className="text-neutral-300">/</span>
                <Link href="/propiedades" className="transition hover:text-neutral-800">Propiedades</Link>
                <span className="text-neutral-300">/</span>
                <span className="break-words font-medium text-neutral-800">{property.title}</span>
            </nav>

            <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div className="order-1 min-w-0 lg:order-2">
                    <PropertyGallery images={imageUrls} />
                </div>

                <header className="order-2 flex min-w-0 flex-col gap-6 rounded-2xl bg-surface-1 p-5 shadow-card sm:gap-7 sm:p-6 lg:order-1 lg:h-full">
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${PROPERTY_STATUS_BADGE_CLASSES[property.status]}`}>
                            {PROPERTY_STATUS_LABELS[property.status]}
                        </span>
                    </div>

                    <div className="space-y-3">
                        <h1 className="break-words font-display text-2xl font-400 leading-tight text-neutral-900 sm:text-3xl lg:text-4xl">
                            {property.title}
                        </h1>
                        <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 sm:text-base">
                            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {property.location_text || "Ubicación por confirmar"}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:mt-auto">
                        <article className="rounded-xl bg-gradient-to-br from-brand-client-50 to-brand-client-100 p-4">
                            <p className="text-xs uppercase tracking-wide text-brand-client-600">Precio</p>
                            <p className="mt-1 break-words font-display text-xl font-400 text-brand-client-900 sm:text-2xl">{formattedPrice}</p>
                        </article>

                        <article className="rounded-xl bg-gradient-to-br from-brand-client-50 to-brand-client-100 p-4">
                            <p className="text-xs uppercase tracking-wide text-brand-client-600">Superficie</p>
                            <p className="mt-1 break-words font-display text-xl font-400 text-brand-client-900 sm:text-2xl">{areaLabel}</p>
                        </article>                    </div>

                </header>
            </section>

            <PropertyDetailTabs
                description={property.description}
                highlights={highlightTexts}
                locationText={property.location_text}
                title={property.title}
                lat={property.lat}
                lng={property.lng}
            />

            <section className="rounded-2xl border-t-2 border-brand-client-400 bg-surface-1 p-5 shadow-card sm:p-6 lg:p-8">
                <div className="mb-5 text-center sm:mb-6">
                    <p className="font-display text-base font-400 text-neutral-800 sm:text-lg">
                        ¿Te interesa esta propiedad?
                    </p>
                    <p className="mt-1.5 text-sm text-neutral-500">
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
                        className="flex-1 min-h-12 rounded-xl bg-brand-700 px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-brand-800 hover:shadow-xl btn-press sm:text-base"
                        iconClassName="h-4 w-4"
                    />

                    <ContactActionButton
                        href={`https://wa.me/${whatsappPhone}`}
                        variant="whatsapp"
                        label="Contactar por WhatsApp"
                        target="_blank"
                        className="flex-1 min-h-12 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition btn-press sm:text-base"
                        iconClassName="h-4 w-4"
                    />
                </div>
            </section>
        </section>
    )
}
