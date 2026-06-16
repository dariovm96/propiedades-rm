# Proposal: Structured Location Fields (Comuna, Region, Sector)

## Intent
Replace the single free-text `location_text` dependency with structured, SEO-friendly location fields. `location_text` remains as the narrative description. This improves search engine structured data, enables consistent filtering, and future-proofs the schema for geographic search.

## Scope

### In Scope
- Add `comuna`, `region`, `sector` as nullable TEXT columns to `properties` (Supabase migration).
- Update `Property` type and `PropertyFormPayload` in TypeScript.
- Add structured fields to the admin form (`PropertyFormFields`) with comuna select, auto-completed region, and free-text sector.
- Persist new fields in the admin PATCH route.
- Update `generateMetadata` and JSON-LD to prefer `comuna`/`region` with fallback to `location_text`.
- Update `PropertyCard` and detail page to display structured location when available.

### Out of Scope
- Data migration for existing properties (manual unless requested).
- Public filtering by comuna/region in this slice.
- Geocoding logic changes (still uses `location_text`).
- Admin dashboard table redesign beyond display string.

## Capabilities

### New Capabilities
- `structured-location`: Schema extension, TypeScript types, admin form inputs, and API persistence for comuna/region/sector.

### Modified Capabilities
- `seo`: Dynamic metadata and JSON-LD `addressLocality`/`addressRegion` now use structured fields with fallback to `location_text`.

## Approach
Extend the `properties` table with three nullable columns. Update all read/write paths in a single vertical slice: types → form → API → metadata/UI. Every consumer must prefer structured fields and fall back to `location_text` to guarantee zero regressions on existing records.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/types/property.ts` | Modified | Add `comuna`, `region`, `sector` to `Property` and `PropertyFormPayload` |
| `src/lib/property-form.ts` | Modified | Add fields to form values and payload mapping |
| `src/components/PropertyFormFields.tsx` | Modified | Add comuna select, region auto-fill, sector input |
| `src/app/admin/propiedades/[id]/route.ts` | Modified | Include new fields in PATCH whitelist/spread |
| `src/app/propiedades/[slug]/page.tsx` | Modified | Metadata + JSON-LD fallback logic |
| `src/components/PropertyCard.tsx` | Modified | Prefer `comuna` over `location_text` |
| `src/app/page.tsx` | Modified | Homepage card location display fallback |
| `src/app/admin/propiedades/nueva/page.tsx` | Modified | Initial form state includes new fields |
| `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx` | Modified | Seed and submit new fields |
| `src/app/admin/dashboard/page.tsx` | Modified | Display structured location or fallback |
| `src/components/PropertyDetailTabs.tsx` | Modified | Pass structured location to detail display |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Existing records show no location until manually filled | High | All UI consumers fallback to `location_text` |
| SEO regression if fallback chain is inconsistent | Med | Centralize location string builder helper; validate JSON-LD output |
| Form geocoding still uses `location_text` which may drift from structured fields | Med | Document that `location_text` remains the geocoding source; defer combined geocoding to future slice |
| Admin dashboard shows confusing data when `location_text` and `comuna` differ | Low | Update dashboard to show `comuna · region` with `location_text` as tooltip |

## Rollback Plan
1. Revert the Supabase migration: `ALTER TABLE properties DROP COLUMN comuna, DROP COLUMN region, DROP COLUMN sector;`
2. Revert all code changes in the 9 affected files to previous git state.
3. No data loss risk because `location_text` is never modified or removed.

## Dependencies
- Supabase migration must be executed manually before code changes are deployed.

## Success Criteria
- [ ] Supabase migration executed and columns are nullable.
- [ ] TypeScript compiles with new fields in `Property` and `PropertyFormPayload`.
- [ ] Admin form creates and edits properties with comuna/region/sector persisted.
- [ ] Properties without new fields render identically to before.
- [ ] `generateMetadata` and JSON-LD use `comuna`/`region` when present, else `location_text`.
- [ ] PropertyCard and detail page show structured location with fallback.
- [ ] No new dependencies installed.
- [ ] No existing tests broken (or manually verified if no test runner exists).

## Pending Decisions

1. **Existing data migration**: Should we attempt to populate `comuna`/`region` for existing records by parsing `location_text`, or leave it fully manual?
2. **Dashboard display**: Should the admin dashboard table show `comuna` instead of `location_text`, or both side-by-side?
3. **Geocoding source**: Should the admin geocode button continue using only `location_text`, or combine `comuna + sector + region` into the geocoding query?
4. **Public filtering**: Is filtering the public list by comuna/region a near-term priority, or should this change remain purely additive for SEO/UI?
5. **Sector in cards**: Should `sector` appear in `PropertyCard`, or only in the detail page?

## Proposal Question Round

The assumptions above are based on the audit and the prompt. If any of these five decisions change, the spec and design will shift. Please confirm or correct each item so the proposal can be finalized.
