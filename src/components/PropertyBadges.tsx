type Props = {
  highlights: string[]
  maxVisible?: number
  className?: string
  showMoreLabel?: string
}

export default function PropertyBadges({
  highlights,
  maxVisible = 3,
  className = "",
  showMoreLabel = "más",
}: Props) {
  const visibleHighlights = highlights.slice(0, maxVisible)
  const remaining = Math.max(highlights.length - visibleHighlights.length, 0)

  if (visibleHighlights.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap ${className}`}>
      {visibleHighlights.map((highlight, index) => (
        <span
          key={`${highlight}-${index}`}
          className="line-clamp-1 rounded-full border border-brand-client-300 bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
        >
          {highlight}
        </span>
      ))}
      {remaining > 0 && (
        <span className="rounded-full border border-brand-client-300 bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500">
          +{remaining} {showMoreLabel}
        </span>
      )}
    </div>
  )
}
