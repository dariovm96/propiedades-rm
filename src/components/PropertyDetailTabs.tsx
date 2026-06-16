"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), { ssr: false })

type PropertyDetailTabsProps = {
  description: string | null
  highlights: string[]
  locationText: string | null
  title: string
  lat: number | null
  lng: number | null
  municipality?: string | null
  region_name?: string | null
  sector_reference?: string | null
  street_address?: string | null
}

type TabKey = "detalle" | "ubicacion"

const TAB_ITEMS: { key: TabKey; label: string }[] = [
  { key: "detalle", label: "Detalle" },
  { key: "ubicacion", label: "Ubicación" },
]

export default function PropertyDetailTabs({ description, highlights, locationText, title, lat, lng, municipality, region_name, sector_reference, street_address }: PropertyDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("detalle")

  const hasDescription = useMemo(() => Boolean(description && description.trim().length > 0), [description])
  const hasHighlights = highlights.length > 0

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-surface-2 p-1.5 shadow-card">
        <div className="grid grid-cols-2 gap-1.5">
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl px-4 py-2.5 text-sm font-medium transition sm:text-base ${isActive ? "bg-surface-1 text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-surface-1 p-5 shadow-card sm:p-6">
        {activeTab === "detalle" && (
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-3">
              <h2 className="font-display text-lg font-400 text-neutral-800 sm:text-xl">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-500 sm:text-base">
                {hasDescription ? description : "Esta propiedad no tiene descripción publicada por ahora."}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-lg font-400 text-neutral-800 sm:text-xl">Amenidades y servicios</h2>

              {hasHighlights ? (
                <div className="grid gap-2.5">
                  {highlights.map((highlight, index) => (
                    <article
                      key={`${highlight}-${index}`}
                      className="flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3"
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-600">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <p className="text-sm text-neutral-700 sm:text-base">{highlight}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500 sm:text-base">
                  Esta propiedad no tiene características publicadas por ahora.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "ubicacion" && (
          <div className="space-y-4">
            <h2 className="font-display text-lg font-400 text-neutral-800 sm:text-xl">Ubicación</h2>

            <div className="rounded-xl bg-surface-2 p-4 space-y-3">
              {municipality && (
                <div className="space-y-1">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-600 sm:text-base">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {municipality}{region_name ? ` · ${region_name}` : ""}
                  </p>
                  {sector_reference && (
                    <p className="text-sm text-neutral-400">
                      Sector: {sector_reference}
                    </p>
                  )}
                  {street_address && (
                    <p className="text-sm text-neutral-400">
                      {street_address}
                    </p>
                  )}
                </div>
              )}
              <p className="flex items-center gap-2 text-sm text-neutral-500 sm:text-base">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {locationText || "Ubicación exacta pendiente de publicación."}
              </p>
              <PropertyMap lat={lat} lng={lng} title={title} />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}