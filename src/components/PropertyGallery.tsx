"use client"

import { useState } from "react"
import ImageWithLoader from "@/components/ImageWithLoader"

type Props = {
  images: string[]
}

export default function PropertyGallery({ images }: Props) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="h-72 md:h-96 bg-brand-100 rounded-xl flex items-center justify-center text-brand-muted">
        Sin imágenes
      </div>
    )
  }

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Imagen principal */}
      <div className="aspect-video w-full overflow-hidden rounded-lg sm:rounded-xl bg-brand-100">
        <ImageWithLoader
          src={images[active]}
          alt="Imagen propiedad"
          wrapperClassName="relative h-full w-full"
          fill
          imageClassName="object-cover"
          unoptimized
        />
      </div>

      {/* Miniaturas */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`aspect-square overflow-hidden rounded border-2 transition ${
              active === index
                ? "border-brand-700"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <ImageWithLoader
              src={img}
              alt={`Miniatura ${index + 1}`}
              wrapperClassName="relative h-full w-full"
              fill
              imageClassName="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>
    </div>
  )
}
