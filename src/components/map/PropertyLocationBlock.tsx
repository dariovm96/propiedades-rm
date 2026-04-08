"use client"

import dynamic from "next/dynamic"

type PropertyLocationBlockProps = {
  latitude?: number | null
  longitude?: number | null
  title: string
  locationText?: string | null
  className?: string
}

const PropertyMap = dynamic(() => import("@/components/map/PropertyMap"), {
  ssr: false,
})

function hasValidCoordinates(latitude?: number | null, longitude?: number | null) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return false
  }

  return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
}

export default function PropertyLocationBlock({ latitude, longitude, title, locationText, className }: PropertyLocationBlockProps) {
  const showMap = hasValidCoordinates(latitude, longitude)

  if (!showMap || typeof latitude !== "number" || typeof longitude !== "number") {
    return (
      <div className={className}>
        <div className="mt-4 flex h-52 items-center justify-center rounded-lg bg-surface-0 text-center text-sm text-content-secondary sm:h-64">
          Ubicación aproximada disponible bajo solicitud. Coordenadas exactas no publicadas.
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mt-4">
        <PropertyMap latitude={latitude} longitude={longitude} title={title} locationText={locationText} />
      </div>
    </div>
  )
}
