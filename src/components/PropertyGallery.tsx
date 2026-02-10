"use client"

import { useState } from "react"

type Props = {
  images: string[]
}

export default function PropertyGallery({ images }: Props) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="h-72 md:h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
        Sin imágenes
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
        <img
          src={images[active]}
          alt="Imagen propiedad"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Miniaturas */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
              active === index
                ? "border-gray-900"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
