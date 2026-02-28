import { useRef, useState } from "react"
import { toast } from "sonner"
import {
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_MB,
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

  const validateAndSelectFiles = (incomingFiles: File[]) => {
    const invalidTypeFiles: string[] = []
    const oversizedFiles: string[] = []
    const validFiles: File[] = []

    incomingFiles.forEach((file) => {
      if (!IMAGE_ALLOWED_MIME_TYPES.includes(file.type as (typeof IMAGE_ALLOWED_MIME_TYPES)[number])) {
        invalidTypeFiles.push(file.name)
        return
      }

      if (file.size > IMAGE_MAX_SIZE_BYTES) {
        oversizedFiles.push(file.name)
        return
      }

      validFiles.push(file)
    })

    if (invalidTypeFiles.length > 0) {
      toast.error("Algunos archivos no son válidos. Solo se permiten JPG, PNG o WEBP.")
    }

    if (oversizedFiles.length > 0) {
      toast.error(`Algunas imágenes superan el límite de ${IMAGE_MAX_SIZE_MB}MB.`)
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return
    validateAndSelectFiles(Array.from(event.target.files))
    event.target.value = ""
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    validateAndSelectFiles(Array.from(event.dataTransfer.files))
  }

  return (
    <div
      className={`border border-brand-300 border-dashed rounded-lg p-4 transition ${isDragging ? "border-brand-700 bg-brand-100" : ""}`}
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
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-700 text-white hover:bg-brand-800 cursor-pointer transition text-sm">
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
        <span className="text-xs text-brand-muted">
          {selectedCount > 0
            ? `${selectedCount} archivo(s) seleccionado(s)`
            : "Ningun archivo seleccionado"}
        </span>
      </div>

      <p className="text-xs text-brand-muted mt-2">
        Arrastra y suelta imágenes aquí o usa el botón para seleccionarlas.
      </p>
      {helperText && <p className="text-xs text-brand-muted mt-1">{helperText}</p>}
    </div>
  )
}