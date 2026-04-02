import { toPropertyDetailViewModel } from "@/lib/properties/property-detail-view-model"
import { describe, expect, it } from "vitest"
import type { PropertySeoDetail } from "@/types/property-seo"
import type { PropertyHighlight } from "@/types/property-highlight"

function buildProperty(overrides: Partial<PropertySeoDetail> = {}): PropertySeoDetail {
  return {
    id: "property-1",
    slug: "departamento-centro",
    title: "Departamento Centro",
    description: "Descripción completa",
    price: 128000000,
    area_m2: 83,
    status: "available",
    images: ["property-images/a.jpg", "property-images/b.jpg"],
    property_type: "departamentos",
    for_sale: true,
    for_rent: false,
    region: "Metropolitana",
    region_slug: "metropolitana",
    commune: "Providencia",
    commune_slug: "providencia",
    latitude: -33.43,
    longitude: -70.62,
    highlighted: true,
    location_text: "Providencia, Santiago",
    contact_phone: "56912345678",
    created_at: null,
    updated_at: null,
    ...overrides,
  }
}

function buildHighlight(overrides: Partial<PropertyHighlight> = {}): PropertyHighlight {
  return {
    id: "highlight-1",
    property_id: "property-1",
    text: "Cocina integrada",
    ...overrides,
  }
}

describe("toPropertyDetailViewModel", () => {
  it("maps full data into canonical detail view model", () => {
    const property = buildProperty()
    const highlights = [buildHighlight()]

    const model = toPropertyDetailViewModel(
      {
        property,
        highlights,
      },
      {
        resolveImageUrl: (path) => `https://cdn.example/${path}`,
      },
    )

    expect(model.title).toBe("Departamento Centro")
    expect(model.description).toBe("Descripción completa")
    expect(model.formattedPrice).toBe("$128.000.000")
    expect(model.areaLabel).toBe("83 m²")
    expect(model.status).toBe("available")
    expect(model.locationText).toBe("Providencia, Santiago")
    expect(model.imageUrls).toEqual([
      "https://cdn.example/property-images/a.jpg",
      "https://cdn.example/property-images/b.jpg",
    ])
    expect(model.highlights).toEqual(["Cocina integrada"])
    expect(model.contact).toEqual({
      phoneWithPrefix: "+56912345678",
      phoneDisplay: "+56912345678",
      whatsappPhone: "56912345678",
    })
    expect(model.map).toEqual({
      latitude: -33.43,
      longitude: -70.62,
    })
  })

  it("handles missing optional values with stable layout defaults", () => {
    const property = buildProperty({
      price: null,
      area_m2: null,
      location_text: null,
      images: null,
      contact_phone: null,
      description: null,
      latitude: null,
      longitude: null,
    })

    const model = toPropertyDetailViewModel({ property, highlights: [] })

    expect(model.formattedPrice).toBe("Precio a consultar")
    expect(model.areaLabel).toBe("Superficie por confirmar")
    expect(model.locationText).toBe("Ubicacion por confirmar")
    expect(model.imageUrls).toEqual([])
    expect(model.description).toBeNull()
    expect(model.highlights).toEqual([])
    expect(model.contact).toEqual({
      phoneWithPrefix: "+56967553564",
      phoneDisplay: "+56 9 6755 3564",
      whatsappPhone: "56967553564",
    })
    expect(model.map).toEqual({
      latitude: null,
      longitude: null,
    })
  })

  it("extracts highlight text from any supported field", () => {
    const property = buildProperty()
    const highlights = [
      buildHighlight({ text: null, title: "Bodega" }),
      buildHighlight({ id: "h-2", text: null, label: "Quincho" }),
      buildHighlight({ id: "h-3", text: "  Terraza  " }),
      buildHighlight({ id: "h-4", text: "" }),
    ]

    const model = toPropertyDetailViewModel({ property, highlights })

    expect(model.highlights).toEqual(["Bodega", "Quincho", "Terraza"])
  })
})
