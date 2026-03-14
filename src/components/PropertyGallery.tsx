"use client"

import { useCallback, useEffect, useState } from "react"
import ImageWithLoader from "@/components/ImageWithLoader"

type Props = {
  images: string[]
}

export default function PropertyGallery({ images }: Props) {
  const [active, setActive] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const safeActive = images.length > 0 ? Math.min(active, images.length - 1) : 0
  const MIN_ZOOM = 1
  const MAX_ZOOM = 3
  const ZOOM_STEP = 0.25

  const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))

  const openZoom = () => {
    setZoomLevel(1)
    setZoomOpen(true)
  }

  const closeZoom = useCallback(() => {
    setZoomOpen(false)
    setZoomLevel(1)
  }, [])

  const changeZoom = (delta: number) => {
    setZoomLevel((prev) => clampZoom(prev + delta))
  }

  const showPrevious = useCallback(() => {
    setActive((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [images.length])

  const showNext = useCallback(() => {
    setActive((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [images.length])

  useEffect(() => {
    if (!zoomOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeZoom()
        return
      }

      if (event.key === "ArrowLeft") {
        showPrevious()
        return
      }

      if (event.key === "ArrowRight") {
        showNext()
      }
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [zoomOpen, closeZoom, showNext, showPrevious])

  if (!images || images.length === 0) {
    return (
      <div className="h-72 md:h-96 rounded-xl border border-border-subtle bg-surface-0 flex items-center justify-center text-content-secondary">
        Sin imágenes
      </div>
    )
  }

  return (
    <div className="max-w-full min-w-0 space-y-3 sm:space-y-4">
      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-0 shadow-sm">
        <div
          className="relative aspect-[4/3] cursor-zoom-in sm:aspect-[16/10]"
          role="button"
          tabIndex={0}
          onClick={openZoom}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              openZoom()
            }
          }}
          aria-label="Abrir imagen en modo zoom"
        >
          <div
            className="flex h-full w-full transition-transform duration-[1400ms] ease-out [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${safeActive * 100}%)` }}
          >
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative h-full min-w-full">
                <ImageWithLoader
                  src={image}
                  alt={`Foto ${index + 1} de la propiedad`}
                  wrapperClassName="relative h-full w-full"
                  fill
                  imageClassName="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>

          <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
            {safeActive + 1} / {images.length}
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  showPrevious()
                }}
                aria-label="Imagen anterior"
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition duration-200 hover:scale-110 hover:text-sky-200 sm:left-3 sm:h-12 sm:w-12"
              >
                <svg className="h-8 w-8 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  showNext()
                }}
                aria-label="Siguiente imagen"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition duration-200 hover:scale-110 hover:text-sky-200 sm:right-3 sm:h-12 sm:w-12"
              >
                <svg className="h-8 w-8 sm:h-9 sm:w-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Seleccionar imagen ${index + 1}`}
              className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === safeActive ? "border-brand-700" : "border-border-subtle hover:border-brand-500"
              }`}
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

      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Zoom de imagen"
          onClick={closeZoom}
        >
          <div
            className="mx-auto flex h-full w-full max-w-6xl flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between text-white">
              <p className="text-sm font-medium">Foto {safeActive + 1} de {images.length}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeZoom(-ZOOM_STEP)}
                  disabled={zoomLevel <= MIN_ZOOM}
                  className="rounded-lg border border-white/35 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Alejar imagen"
                >
                  -
                </button>
                <span className="min-w-14 text-center text-xs sm:text-sm">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => changeZoom(ZOOM_STEP)}
                  disabled={zoomLevel >= MAX_ZOOM}
                  className="rounded-lg border border-white/35 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Acercar imagen"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={closeZoom}
                  className="rounded-lg border border-white/35 px-3 py-1 text-sm"
                  aria-label="Cerrar zoom"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div
              className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-black/50 ring-1 ring-white/20"
              onWheel={(event) => {
                event.preventDefault()
                const delta = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
                changeZoom(delta)
              }}
            >
              <div className="relative flex h-full min-h-[280px] w-full items-center">
                <div
                  className="flex h-full w-full items-center transition-transform duration-[1400ms] ease-out [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateX(-${safeActive * 100}%)` }}
                >
                  {images.map((image, index) => (
                    <div key={`zoom-${image}-${index}`} className="flex h-full min-w-full items-center justify-center p-3 sm:p-6">
                      <div className="relative mx-auto h-[72vh] max-h-[72vh] min-h-[280px] w-full max-w-5xl">
                        <ImageWithLoader
                          src={image}
                          alt={`Zoom foto ${index + 1} de la propiedad`}
                          wrapperClassName="relative h-full w-full"
                          fill
                          imageClassName="object-contain transition-transform duration-200"
                          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                          unoptimized
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    aria-label="Imagen anterior (zoom)"
                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 text-xl font-semibold text-white shadow-md transition hover:bg-black/70 sm:left-4 sm:h-11 sm:w-11"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Siguiente imagen (zoom)"
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/55 text-xl font-semibold text-white shadow-md transition hover:bg-black/70 sm:right-4 sm:h-11 sm:w-11"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
