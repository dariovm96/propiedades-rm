# Design: Structured Location Fields (ubicacion-estructurada)

## Executive Summary
- Add four nullable DB columns (`municipality`, `region_name`, `sector_reference`, `street_address`) already migrated in Supabase; keep `location_text` as narrative.
- Update `Property`, `PropertyFormPayload`, and `PropertyFormValues` types with the new fields; empty strings in the form become `null` in the payload.
- Build a shared `getDisplayLocation()` helper and a `buildGeocodeQuery()` helper to avoid duplicating fallback logic across 9+ UI consumers.
- Expand the admin PATCH route to accept the new fields alongside `highlighted` so the dashboard toggle remains functional.
- SEO metadata and JSON-LD prefer structured fields with mandatory fallback to `location_text`; `street_address` never appears in public UI except JSON-LD.

## Technical Approach
Vertical slice: types → form helpers → admin form → API route → metadata/JSON-LD → public UI cards/detail/dashboard. Every read path uses a centralized fallback helper so existing records with `NULL` structured fields render identically to before.

## Data Flow

```
Admin Form (PropertyFormFields)
  ├── onChange → form state (PropertyFormValues)
  ├── toPropertyPayload → nullifies empty strings
  ├── handleSubmit → Supabase .insert / .update
  └── handleGeocode → buildGeocodeQuery(form) → Nominatim

Public Page (propiedades/[slug])
  ├── getPropertyBySlug → Property (with new fields)
  ├── generateMetadata → getDisplayLocation() fallback chain
  ├── JSON-LD → conditional address keys
  └── Render → header + PropertyDetailTabs

Card / List / Dashboard
  └── getDisplayLocation(property) → municipality ?? location_text ?? fallback
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/property.ts` | Modify | Add 4 fields to `Property` and `PropertyFormPayload` |
| `src/lib/property-form.ts` | Modify | Add 4 fields to `PropertyFormValues` and `toPropertyPayload` |
| `src/lib/location-helpers.ts` | Create | `getDisplayLocation`, `buildGeocodeQuery`, `getRegionForMunicipality` |
| `src/lib/constants.ts` | Modify | Add `MUNICIPALITY_OPTIONS` and `MUNICIPALITY_TO_REGION` map |
| `src/components/PropertyFormFields.tsx` | Modify | Add structured location section with selects/inputs |
| `src/app/admin/propiedades/[id]/route.ts` | Modify | Expand PATCH to accept and persist the 4 new fields |
| `src/app/admin/propiedades/nueva/page.tsx` | Modify | Initialize 4 new fields in form state |
| `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx` | Modify | Seed 4 new fields from existing `Property` |
| `src/app/propiedades/[slug]/page.tsx` | Modify | Update metadata, JSON-LD, detail header |
| `src/components/PropertyCard.tsx` | Modify | Use `getDisplayLocation` for card location line |
| `src/app/page.tsx` | Modify | Add 4 fields to `HighlightedProperty` select and display |
| `src/app/admin/dashboard/page.tsx` | Modify | Display `municipality` with fallback to `location_text` |
| `src/components/PropertyDetailTabs.tsx` | Modify | Accept structured props and render above map |

## Architecture Decisions

| Decision | Option | Tradeoff | Choice |
|----------|--------|----------|--------|
| Fallback logic location | Shared helper `src/lib/location-helpers.ts` | Centralized, testable; one more file | **Shared helper** |
| Region autocomplete | Static mapping in `src/lib/constants.ts` | Simple, no API call; requires manual updates for new municipalities | **Static mapping in constants** |
| Geocode query builder | Helper `buildGeocodeQuery(form)` in `location-helpers.ts` | Reusable between create/edit pages; single source of truth | **Helper function** |
| JSON-LD optional keys | Spread/assign conditionally in page.tsx | Minimal code; no `undefined` keys in output | **Conditional object spread** |
| PATCH route scope | Expand existing PATCH to accept full fields | Slightly more validation logic; avoids second route | **Expand existing PATCH** |

## Interfaces / Contracts

```ts
// src/types/property.ts
export type Property = {
  // ... existing fields
  municipality?: string | null
  region_name?: string | null
  sector_reference?: string | null
  street_address?: string | null
}

export type PropertyFormPayload = Pick<
  Property,
  "title" | "description" | "location_text" | "price" | "status" |
  "area_m2" | "highlighted" | "contact_phone" | "lat" | "lng" |
  "municipality" | "region_name" | "sector_reference" | "street_address"
>

// src/lib/property-form.ts
export type PropertyFormValues = {
  // ... existing fields
  municipality: string
  region_name: string
  sector_reference: string
  street_address: string
}

// src/lib/location-helpers.ts
export function getDisplayLocation(property: Property): string
export function buildGeocodeQuery(form: PropertyFormValues): string
export function getRegionForMunicipality(municipality: string): string | null
```

## SEO Strategy

- **Title city**: `property.municipality || property.location_text || "Melipilla"`
- **Description**: if `municipality` exists, append `${municipality}, ${region_name}`. If `sector_reference` exists, append `Sector ${sector_reference}.` Fallback to existing `location_text` append.
- **JSON-LD `address`**: include `addressLocality` from `municipality` (fallback `location_text`); include `addressRegion` only if `region_name` exists; include `streetAddress` only if `street_address` exists; `addressCountry` always `"CL"`. Omit any key whose value is null/empty.

## Display Rules

| Surface | Rule |
|---------|------|
| PropertyCard | `municipality ?? location_text ?? "Ubicación por confirmar"` |
| Homepage card | Same as PropertyCard |
| Detail header | `municipality && region_name ? "municipality · region_name" : location_text ?? fallback` |
| Detail header subline | `sector_reference ? "Sector: sector_reference" : null` |
| Detail tabs | `locationText` remains narrative; structured block shown above map if available |
| Dashboard | `municipality ?? location_text` |
| street_address | Never shown in public UI (JSON-LD only) |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Fallback helpers | Manual verification via checklist |
| Integration | Form submit → Supabase read | End-to-end manual admin flow |
| E2E | Metadata/JSON-LD output | Inspect page source for `municipality` and absence of `street_address` in UI |

## Migration / Rollout
- No automated data migration. Existing records keep `NULL` structured fields and render via `location_text` fallback.
- Deploy code changes after confirming Supabase columns exist.
- No feature flags needed.

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| PATCH route currently only accepts `highlighted`; adding fields without validation changes could break dashboard toggle | Keep `highlighted` validation as-is; accept optional additional fields only when present |
| Inconsistent fallback strings across UI | Centralize in `getDisplayLocation` helper |
| `street_address` accidentally leaked to public UI | Code review checklist: verify no `street_address` in JSX outside JSON-LD block |

## Open Questions
- None
