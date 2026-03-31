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
    .returns<Omit<HighlightedProperty, "highlights">[]>()

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
    .returns<PropertyHighlight[]>()

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
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden shadow-md">
        <div className="relative min-h-[100svh] w-full md:h-screen">
          <HeroParallaxImage
            src="/images/home/hero-property.webp"
            alt="Propiedad residencial moderna con espacios amplios y luminosos"
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/45 to-black/55" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_55%)]" aria-hidden="true" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl px-4 pt-20 sm:px-6 sm:pt-24 md:pt-0">
            <div className="flex h-full w-full flex-col justify-center gap-6 md:flex-row md:items-center">
              <div className="w-full max-w-2xl md:w-1/2">
                <div className="space-y-5 rounded-3xl border border-white/30 bg-black/35 p-5 text-center shadow-2xl backdrop-blur-md sm:space-y-6 sm:p-8 md:text-left">
                  <span className="inline-flex items-center justify-center rounded-full border border-white/45 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/95 sm:text-xs md:justify-start">
                    Compra y arriendo en RM
                  </span>

                  <h1 className="text-[1.95rem] font-semibold leading-[1.1] text-white sm:text-4xl lg:text-6xl">
                    Encuentra el hogar que estás buscando
                  </h1>

                  <p className="max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                    Propiedades seleccionadas para compra y arriendo, directo con el dueño y sin intermediarios.
                  </p>

                  <a
                    href={TEL_URL}
                    className="inline-flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/40 bg-white/15 px-4 py-3 text-center shadow-sm backdrop-blur-sm transition hover:bg-white/20 md:items-start md:text-left"
                    aria-label={`Llamar al ${CONTACT_PHONE_DISPLAY}`}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/80 sm:text-xs">
                      Atención telefónica prioritaria
                    </span>
                    <span className="mt-1 inline-flex items-center justify-center gap-2 text-lg font-semibold text-white sm:text-xl md:justify-start">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="md:hidden">Llamar ahora</span>
                      <span className="hidden md:inline">{CONTACT_PHONE_DISPLAY}</span>
                    </span>
                    <span className="mt-1 text-[11px] text-white/80 sm:text-xs">{ATTENTION_HOURS_LABEL}</span>
                  </a>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                    <Link
                      href="/propiedades"
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 sm:w-auto"
                    >
                      Ver propiedades
                    </Link>

                    <ContactActionButton
                      href={WHATSAPP_URL}
                      variant="whatsapp"
                      label="Contactar por WhatsApp"
                      target="_blank"
                      className="min-h-12 w-full rounded-xl px-5 py-3 text-sm font-medium shadow-sm focus-visible:ring-white/80 focus-visible:ring-offset-black/40 sm:w-auto"
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
          <section className="space-y-6 py-2 sm:space-y-8 sm:py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 max-md:dark:text-sky-200">Nuestra selección</p>
                <h2 className="text-2xl font-semibold text-content-primary sm:text-3xl">Propiedades destacadas</h2>
                <p className="max-w-2xl text-sm text-content-secondary sm:text-base">
                  Una selección curada para visitar hoy, con información clara y contacto directo.
                </p>
              </div>

              <Link
                href="/propiedades"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 transition hover:text-brand-800 max-md:dark:text-sky-100 max-md:dark:hover:text-white"
              >
                Ver todas las propiedades
                <span aria-hidden="true">→</span>
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
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border-subtle bg-surface-0 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-52 overflow-hidden bg-brand-100">
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

                      <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
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
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen border-y border-[#A9C3EC] bg-[linear-gradient(180deg,#95B5E8_0%,#B7CCEF_18%,#DCE8FB_34%,#EEF4FF_50%,#DCE8FB_66%,#B7CCEF_82%,#95B5E8_100%)] py-12 sm:py-14 max-md:dark:border-border-subtle max-md:dark:bg-none max-md:dark:bg-surface-1">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="space-y-10">
            <ScrollRevealStagger className="space-y-10">
              <div
                className="featured-card-reveal-item space-y-3 text-center"
                style={{ animationDelay: "280ms" }}
              >
                <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl max-md:dark:text-content-primary">¿Por qué elegirnos?</h2>
                <p className="mx-auto max-w-2xl text-sm font-medium text-slate-800 sm:text-base max-md:dark:text-content-secondary">
                  Te acompañamos en cada paso con un enfoque claro, cercano y confiable.
                </p>
              </div>

              <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
                <article
                  className="featured-card-reveal-item rounded-2xl border border-border-subtle bg-surface-0 p-5 text-center shadow-sm sm:p-6"
                  style={{ animationDelay: "760ms", animationDuration: "1950ms" }}
                >
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M3 12l3 3 6-6 3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-content-primary">Sin intermediarios</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-secondary">
                  Conectamos directamente con propietarios para una comunicación rápida y auténtica.
                </p>
                </article>

                <article
                  className="featured-card-reveal-item rounded-2xl border border-border-subtle bg-surface-0 p-5 text-center shadow-sm sm:p-6"
                  style={{ animationDelay: "1080ms", animationDuration: "1950ms" }}
                >
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-content-primary">Atención personalizada</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-secondary">
                  Resolvemos dudas con apoyo humano, claro y adaptado a tus necesidades reales.
                </p>
                </article>

                <article
                  className="featured-card-reveal-item rounded-2xl border border-border-subtle bg-surface-0 p-5 text-center shadow-sm sm:p-6"
                  style={{ animationDelay: "1400ms", animationDuration: "1950ms" }}
                >
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M6 12h12" strokeLinecap="round" />
                    <path d="M6 8h12" strokeLinecap="round" />
                    <path d="M6 16h8" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-content-primary">Proceso transparente</h3>
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
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 max-md:dark:text-sky-200">Propiedad top</p>
              <h2 className="text-2xl font-semibold text-content-primary sm:text-3xl">
                {FEATURED_HOME_VIDEO.title}
              </h2>
              <p className="max-w-3xl text-sm text-content-secondary sm:text-base">
                {FEATURED_HOME_VIDEO.description}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-0 shadow-sm">
              <div className="relative aspect-video w-full bg-black">
                <video
                  className="h-full w-full object-contain"
                  controls
                  preload="metadata"
                  playsInline
                  poster={FEATURED_HOME_VIDEO.poster}
                >
                  <source src={FEATURED_HOME_VIDEO.source} type="video/mp4" />
                  Tu navegador no soporta reproducción de video.
                </video>
              </div>

              <div className="flex border-t border-border-subtle p-4 sm:justify-end sm:p-5">
                <Link
                  href={FEATURED_HOME_VIDEO.ctaHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
                >
                  {FEATURED_HOME_VIDEO.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-3xl space-y-5 text-center">
            <h2 className="text-2xl font-semibold text-content-primary sm:text-3xl">
              ¿Listo para encontrar tu próxima propiedad?
            </h2>

            <p className="text-sm text-content-secondary sm:text-base">
              Explora el catálogo completo y agenda el contacto que más te acomode.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/propiedades"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-700 px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:w-auto"
              >
                Ver propiedades
              </Link>

              <ContactActionButton
                href={TEL_URL}
                variant="phone"
                label="Llamar ahora"
                desktopLabel={CONTACT_PHONE_DISPLAY}
                aria-label={`Llamar al ${CONTACT_PHONE_DISPLAY}`}
                className="min-h-12 w-full rounded-xl px-6 py-3 text-sm font-medium shadow-sm sm:w-auto sm:opacity-95"
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

            <p className="text-xs text-content-secondary sm:text-sm">{ATTENTION_HOURS_LABEL}</p>

          </div>
        </section>
      </div>
    </div>
  )
}
