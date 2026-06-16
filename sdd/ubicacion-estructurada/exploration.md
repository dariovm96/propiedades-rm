# Exploration: ubicacion-estructurada

## executive_summary
- `location_text` is a single free-text field (`string | null`) used across metadata, JSON-LD, UI cards, detail pages, and admin forms. There are no structured location fields today (comuna, region, sector).
- The Leaflet map uses separate `lat`/`lng` columns; `location_text` is only used for geocoding in the admin form, not for map rendering.
- `location_text` appears in **9 source files** (excluding docs and prior OpenSpec artifacts). Every read and render path has a fallback to `"Ubicación por confirmar"` or similar.
- `sitemap.ts` does **not** use `location_text`.
- The admin dashboard (`dashboard/page.tsx`) also renders `location_text` directly in a table cell.

---

## All places where `location_text` is read or rendered

| File | Line(s) | Usage |
|------|---------|-------|
| `src/types/property.ts` | 10 | `location_text: string | null` in `Property` type |
| `src/types/property.ts` | 21 | Included in `PropertyFormPayload` via `Pick` |
| `src/app/propiedades/[slug]/page.tsx` | 75 | Metadata city: `const city = property.location_text \|\| "Melipilla"` |
| `src/app/propiedades/[slug]/page.tsx` | 88 | Metadata description: `if (property.location_text) descriptionParts.push(\`Ubicación: ${property.location_text}.\`)` |
| `src/app/propiedades/[slug]/page.tsx` | 187–193 | JSON-LD `address` block (see section below) |
| `src/app/propiedades/[slug]/page.tsx` | 242 | Rendered in header: `{property.location_text \|\| "Ubicación por confirmar"}` |
| `src/app/propiedades/[slug]/page.tsx` | 263 | Passed to `PropertyDetailTabs` as `locationText={property.location_text}` |
| `src/app/page.tsx` | 21 | `HighlightedProperty` local type includes `location_text: string \| null` |
| `src/app/page.tsx` | 37 | Supabase select list includes `location_text` |
| `src/app/page.tsx` | 233 | Rendered in homepage card: `{property.location_text \|\| "Ubicación por confirmar"}` |
| `src/components/PropertyCard.tsx` | 67 | Rendered in catalog card: `{property.location_text \|\| "Ubicación por confirmar"}` |
| `src/components/PropertyFormFields.tsx` | 63–73 | Input field for `location_text` (label: "Ubicacion") |
| `src/components/PropertyFormFields.tsx` | 114 | Geocode button disabled when `!form.location_text` |
| `src/components/PropertyDetailTabs.tsx` | 11 | Prop type: `locationText: string \| null` |
| `src/components/PropertyDetailTabs.tsx` | 100 | Rendered in Ubicación tab: `{locationText \|\| "Ubicación exacta pendiente de publicación."}` |
| `src/lib/property-form.ts` | 7 | `PropertyFormValues` field: `location_text: string` |
| `src/lib/property-form.ts` | 21 | `toPropertyPayload` converts `form.location_text` to `null` if empty |
| `src/app/admin/propiedades/nueva/page.tsx` | 48 | Initial form state: `location_text: ""` |
| `src/app/admin/propiedades/nueva/page.tsx` | 73 | `handleGeocode` guards against empty `location_text` |
| `src/app/admin/propiedades/nueva/page.tsx` | 83 | `geocodeAddress(form.location_text)` called |
| `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx` | 33 | Initial form state seeded from `property.location_text` |
| `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx` | 110 | `handleGeocode` guards against empty `location_text` |
| `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx` | 120 | `geocodeAddress(form.location_text)` called |
| `src/app/admin/dashboard/page.tsx` | 213 | Table cell: `<td className="p-3">{property.location_text}</td>` |

---

## JSON-LD usage

In `src/app/propiedades/[slug]/page.tsx` (lines 187–193):

```tsx
if (property.location_text) {
  jsonLd.address = {
    "@type": "PostalAddress",
    addressLocality: property.location_text,
    addressCountry: "CL",
  }
}
```

- The `address` object is only included when `location_text` is non-null.
- `addressLocality` is set directly to the raw `location_text` value.
- There is no `addressRegion`, `streetAddress`, or `postalCode` today.

---

## Leaflet map

- **Map component**: `PropertyMap` (lazy-loaded inside `PropertyDetailTabs.tsx`, line 6).
- **Coordinates**: The map receives `lat` and `lng` from the property record (line 102 in `PropertyDetailTabs.tsx`).
- **`location_text` role**: It is **not** used for map rendering or geocoding on the public page. It is displayed as plain text above the map (line 100).
- **Geocoding**: In the admin form, the "Buscar direccion" button uses `geocodeAddress(form.location_text)` to populate `lat`/`lng` fields. This is the only place `location_text` feeds into the map pipeline.

---

## PropertyFormPayload fields

From `src/types/property.ts` (lines 19–22):

```ts
export type PropertyFormPayload = Pick<
  Property,
  "title" | "description" | "location_text" | "price" | "status" | "area_m2" | "highlighted" | "contact_phone" | "lat" | "lng"
>
```

Current fields:
1. `title`
2. `description`
3. `location_text`
4. `price`
5. `status`
6. `area_m2`
7. `highlighted`
8. `contact_phone`
9. `lat`
10. `lng`

---

## Risks y dependencias

1. **Database schema change**: Adding structured fields (comuna, region, sector) requires a Supabase migration and updating the `Property` type.
2. **Metadata/JSON-LD fallback chain**: Every consumer has hardcoded fallbacks (`"Melipilla"`, `"Ubicación por confirmar"`). If we introduce `comuna`, all fallbacks must be updated consistently.
3. **Geocoding coupling**: The admin geocode button is tightly coupled to `location_text`. If we split address into structured fields, we must decide which field(s) drive geocoding.
4. **Admin dashboard**: `dashboard/page.tsx` renders `location_text` raw. If we change what `location_text` represents, the dashboard display may become confusing.
5. **SEO canonical data**: JSON-LD `addressLocality` is currently the free-text `location_text`. Moving to structured fields will improve SEO but requires conditional logic to avoid regressions.
6. **Backward compatibility**: Existing records only have `location_text`. Any new fields must be nullable and all consumers must handle `null` gracefully.

---

## Missing files

- None. All 9 requested files exist and were read.

---

## Exploration: ubicacion-estructurada

### Current State
The system uses a single free-text `location_text` column for everything location-related. It feeds metadata titles/descriptions, JSON-LD `addressLocality`, card labels, detail page headers, and admin geocoding. Separate `lat`/`lng` columns exist for the Leaflet map. There are no structured fields (comuna, region, sector). The admin form provides a single input labeled "Ubicacion" with a geocode button that populates `lat`/`lng`.

### Affected Areas
- `src/types/property.ts` — type definitions for `Property` and `PropertyFormPayload` must include new fields
- `src/app/propiedades/[slug]/page.tsx` — metadata and JSON-LD generation use `location_text`; needs fallback logic to new fields
- `src/app/page.tsx` — homepage cards render `location_text`
- `src/components/PropertyCard.tsx` — catalog cards render `location_text`
- `src/components/PropertyFormFields.tsx` — admin form needs new inputs for comuna/region/sector
- `src/lib/property-form.ts` — `PropertyFormValues` and `toPropertyPayload` need new fields
- `src/app/admin/propiedades/nueva/page.tsx` — creation form needs to submit new fields
- `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx` — edit form needs to load and save new fields
- `src/app/admin/dashboard/page.tsx` — table renders `location_text` directly
- `src/components/PropertyDetailTabs.tsx` — may need to display structured location info

### Approaches
1. **Extend schema with nullable structured fields** — Add `comuna`, `region`, `sector` as nullable columns to the `properties` table. Keep `location_text` as the narrative description. Update all UI components to prefer structured fields with fallback to `location_text`.
   - Pros: Clean separation of concerns, better SEO, enables filtering by comuna/region later, backward compatible
   - Cons: Touches many files (types, forms, metadata, cards, detail), requires Supabase migration
   - Effort: Medium

2. **Parse `location_text` heuristically** — Keep the schema as-is but try to extract comuna/region from `location_text` at render time using regex or a lookup table.
   - Pros: No migration, no form changes
   - Cons: Fragile, inconsistent, poor UX, hard to maintain, breaks on edge cases
   - Effort: Low

### Recommendation
Approach 1. It is the only robust path. `location_text` should remain as the narrative/observational field (e.g., "a 5 min del centro, camino pavimentado"). New structured fields (`comuna`, `region`, `sector`) should be added to the schema and form. Metadata and JSON-LD should prefer `comuna` for `addressLocality` with fallback to `location_text`. Cards should show `comuna` when available. This matches the documented intent in `docs/prompt_ubicacion_estructurada.md`.

### Risks
- Database migration must be reversible and preserve existing `location_text` values
- Geocoding logic in admin needs to decide whether to use `location_text` or a combined structured address for the lookup
- Multiple UI components have fallback strings; inconsistency here degrades UX

### Ready for Proposal
Yes. The codebase is well understood. The next step is `sdd-propose` to define the exact scope: which structured fields to add, migration strategy, and fallback rules per component.
