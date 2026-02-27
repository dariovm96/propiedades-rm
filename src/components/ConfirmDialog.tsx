"use client"

import LoadingSpinner from "@/components/LoadingSpinner"

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title = "¿Estás seguro?",
  message,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-30"
        onClick={() => {
          if (!loading) onCancel()
        }}
      />

      <div className="bg-white rounded-lg max-w-sm mx-auto p-6 z-10">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" className="text-white" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
