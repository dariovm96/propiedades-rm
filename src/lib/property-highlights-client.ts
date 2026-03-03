import {
  PROPERTY_HIGHLIGHT_TEXT_COLUMNS,
  EditablePropertyHighlight,
  PropertyHighlightCreateRequest,
  PropertyHighlightDeleteRequest,
  PropertyHighlight,
  PropertyHighlightUpdateRequest,
  PropertyHighlightsListResponse,
} from "@/types/property-highlight"

function extractHighlightText(record: PropertyHighlight): string {
  const candidates = PROPERTY_HIGHLIGHT_TEXT_COLUMNS.map((column) => record[column])

  const value = candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length > 0)
  return typeof value === "string" ? value.trim() : ""
}

function toCleanHighlightItems(items: EditablePropertyHighlight[]) {
  const unique = new Set<string>()

  return items
    .map((item) => ({
      ...item,
      text: item.text.trim(),
      sort_order: typeof item.sort_order === "number" ? item.sort_order : undefined,
    }))
    .filter((item) => item.text.length > 0)
    .filter((item) => {
      const signature = `${item.id ?? "new"}:${item.text.toLowerCase()}`
      if (unique.has(signature)) {
        return false
      }
      unique.add(signature)
      return true
    })
}

async function assertResponseOk(response: Response) {
  if (response.ok) {
    return
  }

  let message = "No se pudo guardar las características"

  try {
    const body = (await response.json()) as { error?: string }
    if (body?.error) {
      message = body.error
    }
  } catch {}

  throw new Error(message)
}

export async function fetchPropertyHighlights(propertyId: string): Promise<EditablePropertyHighlight[]> {
  const response = await fetch(`/admin/propiedades/${propertyId}/highlights`, {
    method: "GET",
    credentials: "include",
  })

  await assertResponseOk(response)

  const body = (await response.json()) as PropertyHighlightsListResponse
  const items = body.highlights ?? []

  return items
    .map((record) => ({
      id: typeof record.id === "string" ? record.id : undefined,
      text: extractHighlightText(record),
      sort_order: typeof record.sort_order === "number" ? record.sort_order : undefined,
    }))
    .filter((item) => item.text.length > 0)
    .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER))
}

export async function createPropertyHighlights(propertyId: string, items: EditablePropertyHighlight[]) {
  const cleanItems = toCleanHighlightItems(items)
  for (const [index, item] of cleanItems.entries()) {
    const body: PropertyHighlightCreateRequest = { text: item.text, sort_order: index + 1 }

    const response = await fetch(`/admin/propiedades/${propertyId}/highlights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    })

    await assertResponseOk(response)
  }
}

export async function syncPropertyHighlights(
  propertyId: string,
  initialItems: EditablePropertyHighlight[],
  currentItems: EditablePropertyHighlight[]
) {
  const cleanCurrent = toCleanHighlightItems(currentItems)
  const cleanInitial = toCleanHighlightItems(initialItems)

  const normalizedCurrent = cleanCurrent.map((item, index) => ({
    ...item,
    sort_order: index + 1,
  }))

  const currentById = new Map(normalizedCurrent.filter((item) => item.id).map((item) => [item.id!, item]))
  const initialById = new Map(cleanInitial.filter((item) => item.id).map((item) => [item.id!, item]))

  for (const [id, initialItem] of initialById.entries()) {
    const currentItem = currentById.get(id)

    if (!currentItem) {
      const body: PropertyHighlightDeleteRequest = { highlightId: id }

      const deleteResponse = await fetch(
        `/admin/propiedades/${propertyId}/highlights?highlightId=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          credentials: "include",
          body: JSON.stringify(body),
        }
      )

      await assertResponseOk(deleteResponse)
      continue
    }

    if (currentItem.text !== initialItem.text || currentItem.sort_order !== initialItem.sort_order) {
      const body: PropertyHighlightUpdateRequest = {
        id,
        text: currentItem.text,
        sort_order: currentItem.sort_order,
      }

      const updateResponse = await fetch(`/admin/propiedades/${propertyId}/highlights`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      })

      await assertResponseOk(updateResponse)
    }
  }

  const newItems = normalizedCurrent.filter((item) => !item.id)
  for (const item of newItems) {
    const body: PropertyHighlightCreateRequest = { text: item.text, sort_order: item.sort_order }

    const createResponse = await fetch(`/admin/propiedades/${propertyId}/highlights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    })

    await assertResponseOk(createResponse)
  }
}
