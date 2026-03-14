"use client"

import { ReactNode, useEffect, useRef, useState } from "react"

type Props = {
  children: ReactNode
  className?: string
}

export default function ScrollRevealStagger({ children, className }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isVisible || !containerRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (entry?.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.45,
        rootMargin: "0px 0px -4% 0px",
      },
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [isVisible])

  return (
    <div
      ref={containerRef}
      className={`featured-cards-reveal ${isVisible ? "is-visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  )
}
