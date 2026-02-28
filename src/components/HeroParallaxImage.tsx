"use client"

import Image from "next/image"
import { useEffect, useRef } from "react"

type Props = {
  src: string
  alt: string
}

export default function HeroParallaxImage({ src, alt }: Props) {
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateParallax = () => {
      if (!imageRef.current) return

      const offset = Math.min(window.scrollY * 0.22, 64)
      imageRef.current.style.transform = `translate3d(0, ${offset}px, 0) scale(1.14)`
    }

    updateParallax()
    window.addEventListener("scroll", updateParallax, { passive: true })

    return () => {
      window.removeEventListener("scroll", updateParallax)
    }
  }, [])

  return (
    <div ref={imageRef} className="absolute inset-0 will-change-transform">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />
    </div>
  )
}
