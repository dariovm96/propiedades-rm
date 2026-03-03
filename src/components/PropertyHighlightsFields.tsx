import { useState } from "react"
import { EditablePropertyHighlight } from "@/types/property-highlight"

type PropertyHighlightsFieldsProps = {
  items: EditablePropertyHighlight[]
  onChange: (items: EditablePropertyHighlight[]) => void
  disabled?: boolean
}

export default function PropertyHighlightsFields({
  items,
  onChange,
  disabled = false,
}: PropertyHighlightsFieldsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const updateItem = (index: number, nextText: string) => {
    const nextItems = items.map((item, currentIndex) =>
      currentIndex === index ? { ...item, text: nextText } : item
    )

    onChange(nextItems)
  }

  const addItem = () => {
    onChange([...items, { text: "" }])
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, currentIndex) => currentIndex !== index))
  }

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return
    }

    const nextItems = [...items]
    const [moved] = nextItems.splice(fromIndex, 1)
    nextItems.splice(toIndex, 0, moved)
    onChange(nextItems)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-brand-900">Características destacadas</h2>
        <p className="mt-1 text-xs text-brand-muted">
          Agrega frases cortas que quieras resaltar en la publicación.
        </p>
        <p className="mt-1 text-xs font-medium text-brand-700">
          Los 2 primeros highlights se mostrarán en el catálogo.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id || `new-${index}`}
            draggable={!disabled}
            onDragStart={() => setDraggedIndex(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedIndex === null || draggedIndex === index) {
                return
              }

              moveItem(draggedIndex, index)
              setDraggedIndex(null)
            }}
            onDragEnd={() => setDraggedIndex(null)}
            className={`flex gap-2 rounded ${draggedIndex === index ? "opacity-60" : ""}`}
          >
            <button
              type="button"
              disabled={disabled}
              className="shrink-0 rounded border border-brand-300 px-2 text-brand-700 cursor-grab active:cursor-grabbing disabled:opacity-70"
              aria-label={`Reordenar característica ${index + 1}`}
              title="Arrastra para reordenar"
            >
              ⋮⋮
            </button>
            <input
              type="text"
              value={item.text}
              onChange={(event) => updateItem(index, event.target.value)}
              placeholder="Ej: Cercano a metro"
              disabled={disabled}
              className="w-full border border-brand-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-70"
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={disabled}
              className="shrink-0 rounded border border-brand-300 px-3 text-sm text-brand-700 hover:bg-brand-100 disabled:opacity-70"
              aria-label={`Eliminar característica ${index + 1}`}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-70"
      >
        <span aria-hidden="true">＋</span>
        Agregar característica
      </button>
      {items.length > 1 && (
        <p className="text-xs text-brand-muted">Arrastra las filas para definir el orden de aparición.</p>
      )}
    </div>
  )
}
