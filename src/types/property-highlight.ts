export type PropertyHighlight = {
  id: string
  property_id: string
  sort_order?: number | null
  highlight?: string | null
  text?: string | null
  title?: string | null
  label?: string | null
  name?: string | null
  value?: string | null
  description?: string | null
}

export const PROPERTY_HIGHLIGHT_TEXT_COLUMNS = [
  "highlight",
  "text",
  "title",
  "label",
  "name",
  "value",
  "description",
] as const

export type PropertyHighlightTextColumn = (typeof PROPERTY_HIGHLIGHT_TEXT_COLUMNS)[number]

export type PropertyHighlightTextPayload = Partial<Record<PropertyHighlightTextColumn, string>>

export type PropertyHighlightInsertPayload = PropertyHighlightTextPayload & {
  property_id: string
}

export type PropertyHighlightUpdatePayload = PropertyHighlightTextPayload

export type EditablePropertyHighlight = {
  id?: string
  text: string
  sort_order?: number
}

export type PropertyHighlightsListResponse = {
  highlights: PropertyHighlight[]
}

export type PropertyHighlightItemResponse = {
  highlight: PropertyHighlight
}

export type PropertyHighlightCreateRequest = {
  text?: string
  sort_order?: number
  highlight?: Record<string, unknown>
} & Record<string, unknown>

export type PropertyHighlightUpdateRequest = {
  id?: string
  highlightId?: string
  text?: string
  sort_order?: number
  data?: Record<string, unknown>
  highlight?: Record<string, unknown>
} & Record<string, unknown>

export type PropertyHighlightDeleteRequest = {
  id?: string
  highlightId?: string
}

