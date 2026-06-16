# Tasks: Structured Location Fields (ubicacion-estructurada)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 230–260 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Foundation

- [x] 1.1 Create `src/lib/location-helpers.ts` with `getDisplayLocation`, `buildGeocodeQuery`, `getRegionForMunicipality`
- [x] 1.2 Add `MUNICIPALITY_OPTIONS` and `MUNICIPALITY_TO_REGION` to `src/lib/constants.ts`
- [x] 1.3 Add 4 nullable fields to `Property` and `PropertyFormPayload` in `src/types/property.ts`
- [x] 1.4 Add 4 fields to `PropertyFormValues` and `toPropertyPayload` in `src/lib/property-form.ts`
- [x] 1.5 Expand PATCH `src/app/admin/propiedades/[id]/route.ts` to accept and persist the 4 new fields

## Phase 2: Admin Form & Creation

- [x] 2.1 Add structured location section (selects/inputs) to `src/components/PropertyFormFields.tsx`
- [x] 2.2 Initialize 4 new fields in `src/app/admin/propiedades/nueva/page.tsx` form state
- [x] 2.3 Seed 4 new fields from existing `Property` in `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx`

## Phase 3: Public UI & SEO

- [x] 3.1 Update metadata, JSON-LD, and detail header in `src/app/propiedades/[slug]/page.tsx`
- [x] 3.2 Replace `location_text` with `getDisplayLocation` in `src/components/PropertyCard.tsx`
- [x] 3.3 Add 4 fields to `HighlightedProperty` select and display in `src/app/page.tsx`
- [x] 3.4 Update dashboard table to display `municipality` with fallback in `src/app/admin/dashboard/page.tsx`
- [x] 3.5 Render structured block above map in `src/components/PropertyDetailTabs.tsx`

## Phase 4: Verification

- [x] 4.1 Verify `getDisplayLocation` fallback chain for null structured fields
- [x] 4.2 Verify `street_address` never appears in public UI except JSON-LD
- [x] 4.3 Verify admin form submit persists all 4 fields and `location_text` remains
