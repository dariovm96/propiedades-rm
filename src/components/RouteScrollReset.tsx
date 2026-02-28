"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function RouteScrollReset() {
  const pathname = usePathname()

  useEffect(() => {
    const root = document.documentElement
    const previousScrollBehavior = root.style.scrollBehavior

    root.style.scrollBehavior = "auto"
    window.scrollTo(0, 0)

    const frameId = window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousScrollBehavior
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      root.style.scrollBehavior = previousScrollBehavior
    }
  }, [pathname])

  return null
}
