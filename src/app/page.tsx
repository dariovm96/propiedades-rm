import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import { PROPERTY_STATUS_LABELS } from "@/lib/constants"
import { ATTENTION_HOURS_LABEL, CONTACT_PHONE_DISPLAY, TEL_URL, WHATSAPP_URL } from "@/config/contact"
import { FEATURED_HOME_VIDEO } from "@/config/featured-video"
import HeroScrollIndicator from "@/components/HeroScrollIndicator"
import HeroParallaxImage from "@/components/HeroParallaxImage"
import ContactActionButton from "@/components/ContactActionButton"
import ScrollRevealStagger from "@/components/ScrollRevealStagger"
import { PropertyHighlight } from "@/types/property-highlight"

type HighlightedProperty = {
  id: string
  title: string
  slug: string
  price: number | null
  area_m2: number | null
  location_text: string | null
  status: "available" | "sold" | "rented"
  images: string[] | null
  highlights: string[]
}

export const revalidate = 60

async function getHighlightedProperties(): Promise<HighlightedProperty[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("id,title,slug,price,area_m2,location_text,status,images")
    .eq("highlighted", true)
    .order("created_at", { ascending: false })
    .limit(3)
    .overrideTypes<Omit<HighlightedProperty, "highlights">[], { merge: false }>()

  if (error || !data) {
    return []
  }

  const propertyIds = data.map((property) => property.id)
  if (propertyIds.length === 0) {
    return data.map((property) => ({ ...property, highlights: [] }))
  }

  const { data: highlightsData } = await supabase
    .from("property_highlights")
    .select("*")
    .order("sort_order", { ascending: true })
    .in("property_id", propertyIds)
    .overrideTypes<PropertyHighlight[], { merge: false }>()

  const highlightsByPropertyId = (highlightsData ?? []).reduce<Map<string, string[]>>((acc, item) => {
    const value =
      item.highlight || item.text || item.title || item.label || item.name || item.value || item.description

    if (!value || !item.property_id) {
      return acc
    }

    const trimmed = value.trim()
    if (!trimmed) {
      return acc
    }

    const previous = acc.get(item.property_id) ?? []
    acc.set(item.property_id, [...previous, trimmed])
    return acc
  }, new Map<string, string[]>())

  return data.map((property) => ({
    ...property,
    highlights: highlightsByPropertyId.get(property.id) ?? [],
  }))
}

export default async function Home() {
  const highlightedProperties = await getHighlightedProperties()

  return (
    <div className="-mt-[calc(2rem+4.5rem)] sm:-mt-[calc(2.5rem+4.5rem)]">
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
        <div className="relative min-h-[100svh] w-full md:h-screen">
          <HeroParallaxImage
            src="/images/home/hero-property.webp"
            alt="Propiedad residencial moderna con espacios amplios y luminosos"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/70 via-neutral-900/45 to-neutral-900/60" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" aria-hidden="true" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl px-4 pt-20 sm:px-6 sm:pt-24 md:pt-0">
            <div className="flex h-full w-full flex-col justify-center gap-6 md:flex-row md:items-center">
              <div className="w-full max-w-2xl md:w-1/2">
                <div className="space-y-5 rounded-2xl border border-white/20 bg-black/40 p-5 text-center shadow-2xl backdrop-blur-md sm:space-y-6 sm:p-7 md:text-left">
                  <span className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-white/90 md:justify-start">
                    Compra y arriendo en RM
                  </span>

                  <h1 className="font-display text-[1.95rem] font-normal leading-[1.1] text-white sm:text-4xl lg:text-5xl">
                    Encuentra el hogar que estás buscando
                  </h1>

                  <p className="max-w-xl text-sm leading-relaxed text-white/80">
                    Propiedades seleccionadas para compra y arriendo, directo con el dueño y sin intermediarios.
                  </p>

                  <a
                    href={TEL_URL}
                    className="inline-flex w-full max-w-sm flex-col items-center rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-center backdrop-blur-sm transition hover:bg-white/20 btn-press md:items-start md:text-left"
                    aria-label={`Llamar al ${CONTACT_PHONE_DISPLAY}`}
                  >
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-white/70">
                      Atención telefónica prioritaria
                    </span>
                    <span className="mt-1 inline-flex items-center justify-center gap-2 text-lg font-semibold text-white sm:text-xl md:justify-start">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="md:hidden">Llamar ahora</span>
                      <span className="hidden md:inline">{CONTACT_PHONE_DISPLAY}</span>
                    </span>
                    <span className="mt-1 text-xs text-white/70">{ATTENTION_HOURS_LABEL}</span>
                  </a>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                    <Link
                      href="/propiedades"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition hover:bg-neutral-100 hover:shadow-xl btn-press sm:w-auto"
                    >
                      Ver propiedades
                    </Link>

                    <ContactActionButton
                      href={WHATSAPP_URL}
                      variant="whatsapp"
                      label="Contactar por WhatsApp"
                      target="_blank"
                      className="min-h-12 w-full rounded-xl px-5 py-3 text-sm font-medium shadow-md focus-visible:ring-white/80 focus-visible:ring-offset-neutral-900/50 sm:w-auto"
                      iconClassName="h-4 w-4"
                    />
                  </div>
                </div>
              </div>

              <div className="hidden md:block md:w-1/2" />
            </div>
          </div>

          <HeroScrollIndicator targetId="home-content" />
        </div>
      </section>

      <div id="home-content" className="space-y-16 pt-12 sm:space-y-20 sm:pt-14">
        {highlightedProperties.length > 0 && (
          <section className="space-y-8 py-4 sm:space-y-10 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="border-l-2 border-brand-client-400 pl-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-client-600">Nuestra selección</p>
                <h2 className="font-display text-2xl font-normal text-content-primary sm:text-3xl">
                  Propiedades destacadas
                </h2>
                <p className="max-w-2xl text-sm text-content-secondary">
                  Una selección curada para visitar hoy, con información clara y contacto directo.
                </p>
              </div>

<Link
                  href="/propiedades"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-client-600 transition hover:text-brand-client-700"
                >
                  Ver todas las propiedades
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
            </div>

            <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {highlightedProperties.map((property) => {
                const cover = property.images?.[0] ? getPublicImageUrl(property.images[0]) : null
                const catalogHighlights = property.highlights.slice(0, 3)
                const remainingHighlights = Math.max(property.highlights.length - catalogHighlights.length, 0)

                return (
                  <Link
                    key={property.id}
                    href={`/propiedades/${property.slug}`}
                    className="group card-hover transform-gpu flex h-full flex-col overflow-hidden rounded-2xl bg-surface-0 shadow-card border-l-[3px] border-brand-client-400"
                  >
                    <div className="relative h-52 overflow-hidden rounded-t-2xl bg-brand-100">
                      {cover ? (
                        <>
                          <Image
                            src={cover}
                            alt={property.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden="true" />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-brand-muted">
                          Sin imagen
                        </div>
                      )}

                      <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-black/45 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
                        {PROPERTY_STATUS_LABELS[property.status]}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="line-clamp-2 min-h-[2.8rem] text-base font-semibold leading-tight text-content-primary sm:text-lg">
                            {property.title}
                          </h3>
                          <p className="whitespace-nowrap text-sm font-bold text-brand-700 sm:text-base max-md:dark:text-sky-100">
                            {property.price ? `$${property.price.toLocaleString()}` : "Precio a consultar"}
                          </p>
                        </div>

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
                                  className="line-clamp-1 rounded-full border border-brand-client-300 bg-transparent px-2.5 py-1 text-xs text-brand-client-700"
                                >
                                  {highlight}
                                </span>
                              ))}
                              {remainingHighlights > 0 && (
                                <span className="rounded-full border border-brand-client-300 bg-transparent px-2.5 py-1 text-xs text-brand-client-600">
                                  +{remainingHighlights} más
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-y border-brand-client-100 bg-gradient-to-b from-brand-client-50/50 via-neutral-50 to-neutral-50 py-12 sm:py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="space-y-10">
            <ScrollRevealStagger className="space-y-10">
              <div
                className="featured-card-reveal-item space-y-3 text-center"
                style={{ animationDelay: "280ms" }}
              >
                <h2 className="font-display text-2xl font-normal text-neutral-900 sm:text-3xl">¿Por qué elegirnos?</h2>
                <p className="mx-auto max-w-2xl text-sm font-medium text-neutral-600">
                  Te acompañamos en cada paso con un enfoque claro, cercano y confiable.
                </p>
              </div>

              <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
                <article
                  className="featured-card-reveal-item rounded-2xl bg-surface-0 p-5 text-center shadow-card sm:p-6"
                  style={{ animationDelay: "760ms", animationDuration: "1950ms" }}
                >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-client-100 text-brand-client-600">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path d="M3 12l3 3 6-6 3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-normal text-content-primary">Sin intermediarios</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-secondary">
                  Conectamos directamente con propietarios para una comunicación rápida y auténtica.
                </p>
                </article>

                <article
                  className="featured-card-reveal-item rounded-2xl bg-surface-0 p-5 text-center shadow-card sm:p-6"
                  style={{ animationDelay: "1080ms", animationDuration: "1950ms" }}
                >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-client-100 text-brand-client-600">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-normal text-content-primary">Atención personalizada</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-secondary">
                  Resolvemos dudas con apoyo humano, claro y adaptado a tus necesidades reales.
                </p>
                </article>

                <article
                  className="featured-card-reveal-item rounded-2xl bg-surface-0 p-5 text-center shadow-card sm:p-6"
                  style={{ animationDelay: "1400ms", animationDuration: "1950ms" }}
                >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-client-100 text-brand-client-600">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path d="M6 12h12" strokeLinecap="round" />
                    <path d="M6 8h12" strokeLinecap="round" />
                    <path d="M6 16h8" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-normal text-content-primary">Proceso transparente</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-secondary">
                  Presentamos información clara desde el inicio para que tomes decisiones con confianza.
                </p>
                </article>
              </div>
            </ScrollRevealStagger>
          </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <p className="border-l-2 border-brand-client-400 pl-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-client-600">Propiedad top</p>
                  <h2 className="font-display text-2xl font-normal text-content-primary sm:text-3xl">
                    {FEATURED_HOME_VIDEO.title}
                  </h2>
                  <p className="max-w-3xl text-sm text-content-secondary">
                    {FEATURED_HOME_VIDEO.description}
                  </p>
                </div>

                <Link
                  href={FEATURED_HOME_VIDEO.ctaHref}
                  className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-client-600 transition hover:text-brand-client-700"
                >
                  {FEATURED_HOME_VIDEO.ctaLabel}
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl shadow-card">
              <div className="relative aspect-video w-full">
                <video
                  className="h-full w-full object-cover"
                  controls
                  preload="metadata"
                  playsInline
                  poster={FEATURED_HOME_VIDEO.poster}
                >
                  <source src={FEATURED_HOME_VIDEO.source} type="video/mp4" />
                  Tu navegador no soporta reproducción de video.
                </video>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            <h2 className="font-display text-2xl font-normal text-content-primary sm:text-3xl">
              ¿Listo para encontrar tu próxima propiedad?
            </h2>

            <p className="text-sm text-content-secondary">
              Explora el catálogo completo y agenda el contacto que más te acomode.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/propiedades"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-client-500 px-7 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-brand-client-600 hover:shadow-xl btn-press sm:w-auto"
              >
                Ver propiedades
              </Link>

              <ContactActionButton
                href={TEL_URL}
                variant="phone"
                label="Llamar ahora"
                desktopLabel={CONTACT_PHONE_DISPLAY}
                aria-label={`Llamar al ${CONTACT_PHONE_DISPLAY}`}
                className="min-h-12 w-full rounded-xl px-6 py-3 text-sm font-medium shadow-sm sm:w-auto"
                iconClassName="h-4 w-4"
              />

              <ContactActionButton
                href={WHATSAPP_URL}
                variant="whatsapp"
                label="Contactar por WhatsApp"
                target="_blank"
                className="min-h-12 w-full rounded-xl px-6 py-3 text-sm font-medium sm:w-auto"
                iconClassName="h-4 w-4"
              />
            </div>

            <p className="text-xs text-content-secondary">{ATTENTION_HOURS_LABEL}</p>

          </div>
        </section>
      </div>
    </div>
  )
}
