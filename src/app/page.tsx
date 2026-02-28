import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getPublicImageUrl } from "@/lib/storage-helpers"
import { PROPERTY_STATUS_LABELS } from "@/lib/constants"
import { WHATSAPP_URL } from "@/config/contact"
import HeroScrollIndicator from "@/components/HeroScrollIndicator"
import HeroParallaxImage from "@/components/HeroParallaxImage"

type HighlightedProperty = {
  id: string
  title: string
  slug: string
  price: number | null
  area_m2: number | null
  location_text: string | null
  status: "available" | "sold" | "rented"
  images: string[] | null
}

export const revalidate = 60

async function getHighlightedProperties(): Promise<HighlightedProperty[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("id,title,slug,price,area_m2,location_text,status,images")
    .eq("highlighted", true)
    .order("created_at", { ascending: false })
    .limit(3)

  if (error || !data) {
    return []
  }

  return data as HighlightedProperty[]
}

export default async function Home() {
  const highlightedProperties = await getHighlightedProperties()

  return (
    <div className="-mt-[calc(2rem+4.5rem)] sm:-mt-[calc(2.5rem+4.5rem)]">
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden shadow-md">
        <div className="relative min-h-[100svh] w-full md:h-screen">
          <HeroParallaxImage
            src="/images/home/hero-property.jpg"
            alt="Propiedad residencial moderna con espacios amplios y luminosos"
          />

          <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl px-4 sm:px-6">
            <div className="flex h-full w-full flex-col justify-center gap-6 md:flex-row md:items-center">
              <div className="w-full max-w-2xl md:w-1/2">
                <div className="space-y-6 rounded-2xl border border-white/20 bg-black/35 p-6 text-center shadow-md backdrop-blur-sm sm:p-8 md:text-left">
                  <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                    Encuentra el hogar que estás buscando
                  </h1>

                  <p className="text-sm text-brand-100 sm:text-base">
                    Propiedades seleccionadas para compra y arriendo, directo con el dueño y sin intermediarios.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                    <Link
                      href="/propiedades"
                      className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
                    >
                      Ver propiedades
                    </Link>

                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/20"
                    >
                      Contactar por WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="hidden md:block md:w-1/2" />
            </div>
          </div>

          <HeroScrollIndicator targetId="home-content" />
        </div>
      </section>

      <div id="home-content" className="space-y-14 pt-8 sm:space-y-20 sm:pt-10">
        {highlightedProperties.length > 0 && (
          <section className="space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-brand-900 sm:text-3xl">Propiedades destacadas</h2>
            <p className="text-sm text-brand-700 sm:text-base">
              Una selección de oportunidades listas para visitar.
            </p>
          </div>

          <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highlightedProperties.map((property) => {
              const cover = property.images?.[0] ? getPublicImageUrl(property.images[0]) : null
              const keyFeatures = [
                property.area_m2 ? `${property.area_m2} m²` : null,
                PROPERTY_STATUS_LABELS[property.status],
              ].filter(Boolean)

              return (
                <article
                  key={property.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative h-52 overflow-hidden bg-brand-100">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={property.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-brand-muted">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="space-y-3">
                      <h3 className="line-clamp-2 min-h-[3.25rem] text-lg font-semibold text-brand-900">
                        {property.title}
                      </h3>

                      <p className="text-sm text-brand-700 line-clamp-1">{property.location_text || "Ubicación por confirmar"}</p>

                      <div className="flex items-center justify-between gap-2 text-sm">
                        <p className="font-semibold text-brand-900">
                          {property.price ? `$${property.price.toLocaleString()}` : "Precio a consultar"}
                        </p>
                        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
                          {PROPERTY_STATUS_LABELS[property.status]}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {keyFeatures.length > 0 ? (
                          keyFeatures.map((feature) => (
                            <span
                              key={feature}
                              className="rounded-full border border-brand-200 px-2.5 py-1 text-xs text-brand-700"
                            >
                              {feature}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-brand-200 px-2.5 py-1 text-xs text-brand-700">
                            Detalles disponibles en ficha
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/propiedades/${property.slug}`}
                      className="mt-5 inline-flex items-center justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
          </section>
        )}

        <section className="rounded-2xl bg-brand-100 px-5 py-12 sm:px-8 sm:py-14">
          <div className="space-y-10">
            <div className="space-y-3 text-center">
              <h2 className="text-2xl font-semibold text-brand-900 sm:text-3xl">¿Por qué elegirnos?</h2>
              <p className="text-sm text-brand-700 sm:text-base">
                Te acompañamos en cada paso con un enfoque claro, cercano y confiable.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <article className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  ●
                </div>
                <h3 className="text-lg font-semibold text-brand-900">Sin intermediarios</h3>
                <p className="mt-2 text-sm text-brand-700">
                  Conectamos directamente con propietarios para una comunicación rápida y auténtica.
                </p>
              </article>

              <article className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  ●
                </div>
                <h3 className="text-lg font-semibold text-brand-900">Atención personalizada</h3>
                <p className="mt-2 text-sm text-brand-700">
                  Resolvemos dudas con apoyo humano, claro y adaptado a tus necesidades reales.
                </p>
              </article>

              <article className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  ●
                </div>
                <h3 className="text-lg font-semibold text-brand-900">Proceso transparente</h3>
                <p className="mt-2 text-sm text-brand-700">
                  Presentamos información clara desde el inicio para que tomes decisiones con confianza.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-brand-100/60 px-5 py-14 text-center sm:px-8 sm:py-16">
          <div className="mx-auto max-w-2xl space-y-5">
            <h2 className="text-2xl font-semibold text-brand-900 sm:text-3xl">
              ¿Listo para encontrar tu próxima propiedad?
            </h2>

            <p className="text-sm text-brand-700 sm:text-base">
              Explora el catálogo completo y agenda el contacto que más te acomode.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/propiedades"
                className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-800"
              >
                Ver catálogo completo
              </Link>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-brand-300 px-6 py-3 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
              >
                Contactar por WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
