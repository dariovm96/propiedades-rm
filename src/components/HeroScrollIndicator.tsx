"use client"

import { useEffect, useRef } from "react"

type Props = {
	targetId: string
}

function easeOutCubic(progress: number) {
	return 1 - Math.pow(1 - progress, 3)
}

export default function HeroScrollIndicator({ targetId }: Props) {
	const rafIdRef = useRef<number | null>(null)

	useEffect(() => {
		return () => {
			if (rafIdRef.current !== null) {
				window.cancelAnimationFrame(rafIdRef.current)
			}
		}
	}, [])

	const handleClick = () => {
		const target = document.getElementById(targetId)
		if (!target) return

		if (rafIdRef.current !== null) {
			window.cancelAnimationFrame(rafIdRef.current)
			rafIdRef.current = null
		}

		const startY = window.scrollY
		const headerElement = document.querySelector("header")
		const headerHeight = headerElement instanceof HTMLElement
			? headerElement.getBoundingClientRect().height
			: 0
		const targetY = target.getBoundingClientRect().top + window.scrollY - headerHeight + 2
		const distance = targetY - startY
		if (Math.abs(distance) < 2) return

		const duration = 1600
		const initialProgress = 0.02
		const startTime = performance.now()
		const root = document.documentElement
		const previousScrollBehavior = root.style.scrollBehavior

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
				window.scrollTo(0, Math.round(targetY))
				root.style.scrollBehavior = previousScrollBehavior
				rafIdRef.current = null
			}
		}

		rafIdRef.current = window.requestAnimationFrame(step)
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label="Ir a la siguiente sección"
			className="absolute bottom-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center justify-center text-white/85 transition hover:text-white"
		>
			<span className="inline-flex h-9 w-9 animate-soft-bounce items-center justify-center rounded-full border border-white/60 bg-black/25">
				<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
						clipRule="evenodd"
					/>
				</svg>
			</span>
		</button>
	)
}
