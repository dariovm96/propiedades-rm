import { useRef, useState } from "react"
import { toast } from "sonner"
import {
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_MB,
  IMAGE_MIN_LONGEST_SIDE_PX,
  IMAGE_RECOMMENDED_ASPECT_RATIOS,
  IMAGE_RECOMMENDED_ASPECT_RATIO_TOLERANCE,
} from "@/lib/constants"

type ImageFilePickerProps = {
  selectedCount: number
  onFilesSelected: (files: File[]) => void
  helperText?: string
}

export default function ImageFilePicker({
  selectedCount,
  onFilesSelected,
  helperText,
}: ImageFilePickerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const formatFileList = (names: string[], max = 3) => {
    if (names.length <= max) {
      return names.join(", ")
    }

    const visible = names.slice(0, max).join(", ")
    return `${visible} y ${names.length - max} más`
  }

  const getImageDimensions = (file: File) =>
    new Promise<{ width: number; height: number }>((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file)
      const image = new Image()

      image.onload = () => {
        const dimensions = { width: image.naturalWidth, height: image.naturalHeight }
        URL.revokeObjectURL(objectUrl)
        resolve(dimensions)
      }

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error(`No se pudo leer dimensiones de ${file.name}`))
      }

      image.src = objectUrl
    })

  const isRecommendedAspectRatio = (width: number, height: number) => {
    const ratio = width / height
    return IMAGE_RECOMMENDED_ASPECT_RATIOS.some(
      (targetRatio) => Math.abs(ratio - targetRatio) <= IMAGE_RECOMMENDED_ASPECT_RATIO_TOLERANCE
    )
  }

  const validateAndSelectFiles = async (incomingFiles: File[]) => {
    const invalidTypeFiles: string[] = []
    const oversizedFiles: string[] = []
    const lowResolutionFiles: string[] = []
    const nonRecommendedRatioFiles: string[] = []
    const unreadableFiles: string[] = []
    const validFiles: File[] = []

    for (const file of incomingFiles) {
      if (!IMAGE_ALLOWED_MIME_TYPES.includes(file.type as (typeof IMAGE_ALLOWED_MIME_TYPES)[number])) {
        invalidTypeFiles.push(file.name)
        continue
      }

      if (file.size > IMAGE_MAX_SIZE_BYTES) {
        oversizedFiles.push(file.name)
        continue
      }

      try {
        const { width, height } = await getImageDimensions(file)
        const longestSide = Math.max(width, height)

        if (longestSide < IMAGE_MIN_LONGEST_SIDE_PX) {
          lowResolutionFiles.push(file.name)
        }

        if (!isRecommendedAspectRatio(width, height)) {
          nonRecommendedRatioFiles.push(file.name)
        }
      } catch {
        unreadableFiles.push(file.name)
        continue
      }

      validFiles.push(file)
    }

    if (invalidTypeFiles.length > 0) {
      toast.error("Algunos archivos no son válidos. Solo se permiten JPG, PNG o WEBP.")
    }

    if (oversizedFiles.length > 0) {
      toast.error(`Algunas imágenes superan el límite de ${IMAGE_MAX_SIZE_MB}MB.`)
    }

    if (lowResolutionFiles.length > 0) {
      toast.warning(
        `Calidad ideal no alcanzada en: ${formatFileList(lowResolutionFiles)} (lado mayor sugerido: ${IMAGE_MIN_LONGEST_SIDE_PX}px, puedes subirla igual).`
      )
    }

    if (unreadableFiles.length > 0) {
      toast.error("No se pudieron leer algunas imágenes para validación.")
    }

    if (nonRecommendedRatioFiles.length > 0) {
      toast.warning(
        `Proporción sugerida no cumplida en: ${formatFileList(nonRecommendedRatioFiles)}. Ideal: 4:3 o 3:2 (puedes subirla igual).`
      )
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
  }

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return
    await validateAndSelectFiles(Array.from(event.target.files))
    event.target.value = ""
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    await validateAndSelectFiles(Array.from(event.dataTransfer.files))
  }

  return (
    <div
      className={`border border-brand-300 border-dashed rounded-lg p-4 transition dark:border-border-default dark:bg-surface-1/40 ${isDragging ? "border-brand-700 bg-brand-100 dark:border-border-strong dark:bg-surface-2" : ""}`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragEnter={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        if (event.currentTarget === event.target) {
          setIsDragging(false)
        }
      }}
      onDrop={handleDrop}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-700 text-white hover:bg-brand-800 cursor-pointer transition text-sm dark:bg-[#372e23] dark:hover:bg-[#443a29]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Seleccionar imagenes
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleInputChange}
            className="sr-only"
          />
        </label>
        <span className="text-xs text-brand-muted dark:text-content-muted">
          {selectedCount > 0
            ? `${selectedCount} archivo(s) seleccionado(s)`
            : "Ningun archivo seleccionado"}
        </span>
      </div>

      <p className="text-xs text-brand-muted dark:text-content-muted mt-2">
        Arrastra y suelta imágenes aquí o usa el botón para seleccionarlas.
      </p>
      <p className="text-xs text-brand-muted dark:text-content-muted mt-1">
        Calidad ideal: lado mayor entre {IMAGE_MIN_LONGEST_SIDE_PX} y 2600px, proporción 4:3 o 3:2. Es una recomendación, no bloquea la carga.
      </p>
      {helperText && <p className="text-xs text-brand-muted dark:text-content-muted mt-1">{helperText}</p>}
    </div>
  )
}