import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import type { PropertySeoDetail } from "@/types/property-seo"
import type { PropertyHighlight } from "@/types/property-highlight"
import { toPropertyDetailViewModel } from "@/lib/properties/property-detail-view-model"
import PropertyDetailVisual from "@/components/property-detail/PropertyDetailVisual"

function buildProperty(overrides: Partial<PropertySeoDetail> = {}): PropertySeoDetail {
  return {
    id: "property-2",
    slug: "casa-nunoa",
    title: "Casa Ñuñoa",
    description: null,
    price: null,
    area_m2: null,
    status: "available",
    images: null,
    property_type: "casas",
    for_sale: true,
    for_rent: false,
    region: "Metropolitana",
    region_slug: "metropolitana",
    commune: "Ñuñoa",
    commune_slug: "nunoa",
    latitude: null,
    longitude: null,
    highlighted: false,
    location_text: null,
    contact_phone: null,
    created_at: null,
    updated_at: null,
    ...overrides,
  }
}

describe("property detail visual restore guardrails", () => {
  it("keeps canonical JSON-LD emission with shared visual composition", () => {
    const canonicalPage = readFileSync("src/app/[tipo]/[...segments]/page.tsx", "utf-8")

    expect(canonicalPage).toMatch(/<script type="application\/ld\+json"/)
    expect(canonicalPage).toMatch(/<PropertyDetailVisual model=\{viewModel\} \/>/)
    expect(canonicalPage).toMatch(/toPropertyDetailViewModel/)
    expect(canonicalPage).toMatch(/getPublicPropertyHighlightsByPropertyId/)
  })

  it("renders baseline sections even when optional data is missing", () => {
    const model = toPropertyDetailViewModel({
      property: buildProperty(),
      highlights: [] as PropertyHighlight[],
    })

    const html = renderToStaticMarkup(<PropertyDetailVisual model={model} />)

    expect(html).toMatch(/Contacto prioritario/)
    expect(html).toMatch(/Precio/)
    expect(html).toMatch(/Superficie/)
    expect(html).toMatch(/Sin imágenes/)
  })

  it("removes diagnostics and publication preview from admin create and edit flows", () => {
    const createPage = readFileSync("src/app/admin/propiedades/nueva/page.tsx", "utf-8")
    const editPage = readFileSync("src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx", "utf-8")

    expect(createPage).not.toMatch(/startRefreshDiagnosticsTrace/)
    expect(editPage).not.toMatch(/startRefreshDiagnosticsTrace/)
    expect(createPage).not.toMatch(/Vista previa de publicación/)
    expect(editPage).not.toMatch(/Vista previa de publicación/)
  })
})
