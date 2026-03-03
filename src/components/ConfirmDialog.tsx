"use client"

import { useEffect } from "react"
import LoadingSpinner from "@/components/LoadingSpinner"

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  loading?: boolean
  cancelLabel?: string
  confirmLabel?: string
  confirmIntent?: "danger" | "primary"
  confirmButtonClassName?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = "¿Estás seguro?",
  message,
  loading = false,
  cancelLabel = "Cancelar",
  confirmLabel = "Eliminar",
  confirmIntent = "danger",
  confirmButtonClassName,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open || loading) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => {
      window.removeEventListener("keydown", handleEscape)
    }
  }, [open, loading, onCancel])

  if (!open) return null

  const intentClass =
    confirmIntent === "primary" ? "bg-brand-700 hover:bg-brand-800" : "bg-red-600 hover:bg-red-700"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-brand-900/30"
        onClick={() => {
          if (!loading) onCancel()
        }}
      />

      <div className="bg-white border border-brand-200 rounded-lg max-w-sm mx-auto p-6 z-10">
        <h3 className="text-lg font-medium text-brand-900">{title}</h3>
        <p className="mt-2 text-sm text-brand-700">{message}</p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded border border-brand-300 text-brand-700 hover:bg-brand-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded text-white disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              confirmButtonClassName ?? intentClass
            }`}
          >
            {loading && <LoadingSpinner size="sm" className="text-white" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
