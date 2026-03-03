"use client"

import { useEffect, useState } from "react"
import ImageWithLoader from "@/components/ImageWithLoader"

type Props = {
  images: string[]
}

export default function PropertyGallery({ images }: Props) {
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const sideIndexes = [1, 2, 3, 4].filter((index) => images[index])
  const extraPhotos = Math.max(images.length - 5, 0)
  const sideGridRowsClass = sideIndexes.length <= 2 ? "md:grid-rows-1" : "md:grid-rows-2"

  const openLightboxAt = (index: number) => {
    setActive(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const showPrevious = () => {
    setActive((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const showNext = () => {
    setActive((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (!lightboxOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox()
        return
      }

      if (event.key === "ArrowLeft") {
        setActive((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        return
      }

      if (event.key === "ArrowRight") {
        setActive((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [lightboxOpen, images.length])

  if (!images || images.length === 0) {
    return (
      <div className="h-72 md:h-96 rounded-xl border border-border-subtle bg-surface-0 flex items-center justify-center text-content-secondary">
        Sin imágenes
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3 sm:space-y-4">
        <div className="grid gap-3 md:grid-cols-[1.35fr_1fr]">
          <button
            onClick={() => openLightboxAt(0)}
            aria-label="Ver imagen en detalle"
            className="relative aspect-[16/11] overflow-hidden rounded-xl border-2 border-brand-700 shadow-md transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <ImageWithLoader
              src={images[0]}
              alt="Imagen principal propiedad"
              wrapperClassName="relative h-full w-full"
              fill
              imageClassName="object-cover transition-transform duration-500 hover:scale-[1.02]"
              unoptimized
            />
          </button>

          {sideIndexes.length > 0 && (
            <div className={`grid grid-cols-2 gap-3 md:h-full ${sideGridRowsClass}`}>
              {sideIndexes.map((index, slot) => {
                const isLastVisibleSlot = slot === sideIndexes.length - 1
                const showOverlay = isLastVisibleSlot && extraPhotos > 0

                return (
                  <button
                    key={index}
                    onClick={() => openLightboxAt(index)}
                    aria-label={showOverlay ? "Ver todas las fotos" : `Ver imagen ${index + 1}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl border-2 border-border-subtle transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 md:h-full md:aspect-auto"
                  >
                    <ImageWithLoader
                      src={images[index]}
                      alt={`Imagen propiedad ${index + 1}`}
                      wrapperClassName="relative h-full w-full"
                      fill
                      imageClassName="object-cover transition-transform duration-300 hover:scale-[1.02]"
                      unoptimized
                    />

                    {showOverlay && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-center text-sm font-semibold text-white">
                        Ver todas las fotos {extraPhotos > 0 ? `(+${extraPhotos})` : ""}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => openLightboxAt(0)}
            className="inline-flex items-center justify-center rounded-lg border border-border-subtle bg-surface-0 px-4 py-2 text-sm font-medium text-content-secondary transition hover:text-content-primary"
          >
            Ver todas las fotos ({images.length})
          </button>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Galería de fotos"
          onClick={closeLightbox}
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between text-white">
              <p className="text-sm font-medium">
                Foto {active + 1} de {images.length}
              </p>
              <button
                onClick={closeLightbox}
                className="rounded-lg border border-white/30 px-3 py-1.5 text-sm hover:bg-white/10"
                aria-label="Cerrar galería"
              >
                Cerrar
              </button>
            </div>

            <div className="relative mx-auto w-full max-w-5xl flex-1">
              <div className="relative h-[60vh] min-h-[320px] overflow-hidden rounded-xl bg-black/60 ring-1 ring-white/15 sm:h-[68vh] lg:h-[72vh]">
              <ImageWithLoader
                src={images[active]}
                alt={`Foto ${active + 1} de la propiedad`}
                wrapperClassName="relative h-full w-full"
                fill
                imageClassName="object-contain"
                unoptimized
              />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={showPrevious}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-3 text-2xl leading-none text-white shadow-lg hover:bg-black/80 sm:-left-10 sm:p-4 sm:text-3xl lg:-left-14"
                    aria-label="Foto anterior"
                  >
                    ‹
                  </button>
                  <button
                    onClick={showNext}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 rounded-full bg-black/65 p-3 text-2xl leading-none text-white shadow-lg hover:bg-black/80 sm:-right-10 sm:p-4 sm:text-3xl lg:-right-14"
                    aria-label="Foto siguiente"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setActive(index)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 ${
                      index === active ? "border-white" : "border-white/30"
                    }`}
                    aria-label={`Ir a foto ${index + 1}`}
                  >
                    <ImageWithLoader
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                      wrapperClassName="relative h-full w-full"
                      fill
                      imageClassName="object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
