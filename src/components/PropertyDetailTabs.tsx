"use client"

import { useMemo, useState } from "react"

type PropertyDetailTabsProps = {
  description: string | null
  highlights: string[]
  locationText: string | null
}

type TabKey = "detalle" | "ubicacion"

const TAB_ITEMS: { key: TabKey; label: string }[] = [
  { key: "detalle", label: "Detalle" },
  { key: "ubicacion", label: "Ubicación" },
]

export default function PropertyDetailTabs({ description, highlights, locationText }: PropertyDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("detalle")

  const hasDescription = useMemo(() => Boolean(description && description.trim().length > 0), [description])
  const hasHighlights = highlights.length > 0

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border-subtle bg-surface-1/60 p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition sm:text-base ${
                  isActive
                    ? "border-brand-700 bg-brand-700 text-white shadow"
                    : "border-border-subtle bg-surface-0 text-content-secondary hover:text-content-primary"
                }`}
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-0 p-5 shadow-sm sm:p-6">
        {activeTab === "detalle" && (
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-content-primary">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-content-secondary sm:text-base">
                {hasDescription ? description : "Esta propiedad no tiene descripcion publicada por ahora."}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-content-primary">Amenidades y servicios</h2>

              {hasHighlights ? (
                <div className="grid gap-3">
                  {highlights.map((highlight, index) => (
                    <article
                      key={`${highlight}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-1 px-4 py-3"
                    >
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                        ✓
                      </span>
                      <p className="text-sm text-content-secondary sm:text-base">{highlight}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-content-secondary sm:text-base">
                  Esta propiedad no tiene caracteristicas publicadas por ahora.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "ubicacion" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-content-primary">Ubicacion</h2>

            <div className="rounded-xl border border-dashed border-border-subtle bg-surface-1 p-4">
              <p className="text-sm text-content-secondary sm:text-base">
                {locationText || "Ubicacion exacta pendiente de publicacion."}
              </p>
              <div className="mt-4 flex h-52 items-center justify-center rounded-lg bg-surface-0 text-center text-sm text-content-secondary sm:h-64">
                Mapa interactivo (Leaflet) proximamente.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
