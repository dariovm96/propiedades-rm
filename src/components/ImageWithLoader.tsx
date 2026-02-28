"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"
import LoadingSpinner from "@/components/LoadingSpinner"

type ImageWithLoaderProps = Omit<ImageProps, "className"> & {
  alt: string
  wrapperClassName?: string
  imageClassName?: string
}

export default function ImageWithLoader({
  alt,
  wrapperClassName = "",
  imageClassName = "",
  ...imageProps
}: ImageWithLoaderProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={wrapperClassName}>
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-brand-100/85 backdrop-blur-[1px]">
          <LoadingSpinner size="md" className="text-brand-500" />
        </div>
      )}

      <Image
        {...imageProps}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`${imageClassName} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  )
}