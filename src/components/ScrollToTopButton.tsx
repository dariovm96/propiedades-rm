"use client"

import { useEffect, useRef, useState } from "react"

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3)
}

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)

      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  const handleScrollToTop = () => {
    const startY = window.scrollY
    const targetY = 0
    const distance = targetY - startY
    if (Math.abs(distance) < 2) return

    if (rafIdRef.current !== null) {
      window.cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }

    const duration = 1600
    const initialProgress = 0.02
    const startTime = performance.now()
    const root = document.documentElement

    root.style.scrollBehavior = "auto"
    window.scrollTo(0, startY + distance * initialProgress)

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)
      const blendedProgress = initialProgress + (1 - initialProgress) * eased

      window.scrollTo(0, startY + distance * blendedProgress)

      if (progress < 1) {
        rafIdRef.current = window.requestAnimationFrame(step)
      } else {
        root.style.scrollBehavior = ""
        rafIdRef.current = null
      }
    }

    rafIdRef.current = window.requestAnimationFrame(step)
  }

  return (
    <button
      type="button"
      aria-label="Volver arriba"
      onClick={handleScrollToTop}
      className={`fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-300 bg-white/90 text-brand-700 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-brand-900 ${
        isVisible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"
      }`}
    >
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 4.25a.75.75 0 01.53.22l4.5 4.5a.75.75 0 11-1.06 1.06l-3.22-3.22V15a.75.75 0 01-1.5 0V6.81l-3.22 3.22a.75.75 0 11-1.06-1.06l4.5-4.5A.75.75 0 0110 4.25z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}
