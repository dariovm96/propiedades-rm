# Structured Location Specification

## Purpose
Extend the `properties` schema and all related read/write paths to support structured geographic location fields (`municipality`, `region_name`, `sector_reference`, `street_address`) while keeping `location_text` as the narrative description. This enables consistent SEO data, admin form structure, and future filtering without breaking existing records.

## Requirements

### Requirement: Schema Extension
The `properties` table MUST include four nullable `TEXT` columns: `municipality`, `region_name`, `sector_reference`, `street_address`. Existing records MUST remain valid with `NULL` values. `location_text` MUST NOT be removed, renamed, or deprecated.

#### Scenario: Database columns exist
- GIVEN the Supabase migration has been executed
- WHEN a new property is inserted without the new fields
- THEN the insert succeeds with `NULL` values for the four columns

#### Scenario: Existing records unchanged
- GIVEN a property created before the migration
- WHEN it is queried after the migration
- THEN `municipality`, `region_name`, `sector_reference`, `street_address` are `NULL`
- AND `location_text` retains its original value

### Requirement: TypeScript Types
The `Property` type MUST include `municipality?: string | null`, `region_name?: string | null`, `sector_reference?: string | null`, `street_address?: string | null`. The `PropertyFormPayload` type MUST include the same four fields as `string` (empty string when not filled). `PropertyFormValues` MUST include the four fields as `string` with empty string defaults.

#### Scenario: Type compatibility
- GIVEN a property fetched from Supabase
- WHEN it is typed as `Property`
- THEN the TypeScript compiler accepts accessing the four new fields

#### Scenario: Form payload compatibility
- GIVEN an admin form submission
- WHEN it is typed as `PropertyFormPayload`
- THEN all four fields are present as strings, even if empty

### Requirement: Admin Form Inputs
`PropertyFormFields` MUST render a new "Ubicación" section below the `location_text` field containing: a `municipality` select with options `[Melipilla, La Estrella, Otra]`; a `region_name` select auto-completed based on municipality selection but editable; a `street_address` free-text input with placeholder `ej: Camino Lo Chacón 150, Melipilla`; and a `sector_reference` free-text input with placeholder `ej: sector Lo Chacón, camino a Pomaire`. All four fields MUST be optional. The `location_text` label MUST change to "Descripción de ubicación".

#### Scenario: Admin creates property with structured location
- GIVEN the admin selects "Melipilla" from the municipality dropdown
- WHEN the form renders
- THEN `region_name` auto-populates to "Región Metropolitana de Santiago"
- AND the admin MAY change the region manually

#### Scenario: Admin selects "Otra"
- GIVEN the admin selects "Otra" from the municipality dropdown
- WHEN the form renders
- THEN `region_name` becomes a free-text input or editable select

#### Scenario: Admin leaves structured fields empty
- GIVEN the admin creates a property with all structured fields empty
- WHEN the form is submitted
- THEN the payload sends empty strings for the four fields
- AND the API persists them as `NULL` or empty string according to the mapping logic

### Requirement: Admin Form State Initialization
`NuevaPropiedadPage` and `EditPropertyForm` MUST initialize the four new fields with empty string values. `EditPropertyForm` MUST seed them from the existing `Property` values when editing.

#### Scenario: Edit existing property
- GIVEN an existing property with `municipality = "Melipilla"`
- WHEN the edit form loads
- THEN the municipality select shows "Melipilla"
- AND the region select shows the corresponding region name

### Requirement: API Persistence
The PATCH route at `src/app/admin/propiedades/[id]/route.ts` MUST persist `municipality`, `region_name`, `sector_reference`, and `street_address` when included in the request body. The route MUST validate and update the four fields alongside existing fields without changing authentication or authorization logic.

#### Scenario: PATCH with structured fields
- GIVEN a valid admin PATCH request with the four new fields
- WHEN the route processes it
- THEN the property row is updated with the provided values

#### Scenario: PATCH without structured fields
- GIVEN a valid admin PATCH request without the four new fields
- WHEN the route processes it
- THEN the existing values for the four fields are preserved
- AND other fields are updated normally

### Requirement: Geocoding Query Source
The "Buscar dirección" geocoding button in the admin form MUST use `street_address + municipality + region_name` as the query string when `street_address` is present, falling back to `location_text` when `street_address` is empty.

#### Scenario: Geocode with structured fields
- GIVEN `street_address = "Camino Lo Chacón 150"`, `municipality = "Melipilla"`, `region_name = "Región Metropolitana de Santiago"`
- WHEN the admin clicks "Buscar dirección"
- THEN the geocoding query is `"Camino Lo Chacón 150, Melipilla, Región Metropolitana de Santiago"`

#### Scenario: Geocode fallback
- GIVEN `street_address` is empty
- WHEN the admin clicks "Buscar dirección"
- THEN the geocoding query falls back to `location_text`

### Requirement: PropertyCard Display
`PropertyCard` MUST display `municipality` when it exists, with the existing pin icon. If `municipality` is null or empty, it MUST fall back to `location_text` with the same behavior as before.

#### Scenario: Card with municipality
- GIVEN a property with `municipality = "Melipilla"`, `location_text = "cerca del centro"`
- WHEN the card renders
- THEN it displays "Melipilla" with the pin icon

#### Scenario: Card fallback
- GIVEN a property with `municipality = null`, `location_text = "cerca del centro"`
- WHEN the card renders
- THEN it displays "cerca del centro" as before

### Requirement: Homepage Display
The homepage (`src/app/page.tsx`) highlighted properties list MUST display `municipality` when present, falling back to `location_text`.

#### Scenario: Homepage card with structured location
- GIVEN a highlighted property with `municipality = "La Estrella"`
- WHEN the homepage card renders
- THEN it displays "La Estrella"

### Requirement: Admin Dashboard Display
`DashboardPage` MUST display `municipality` in the location table cell when present, and fall back to `location_text`. If both exist, it MAY display both.

#### Scenario: Dashboard with structured location
- GIVEN a property with `municipality = "Melipilla"`, `location_text = "cerca del centro"`
- WHEN the dashboard table renders
- THEN it displays "Melipilla" or "Melipilla — cerca del centro"

### Requirement: Property Detail Display
The property detail page (`/propiedades/[slug]`) MUST show `municipality · region_name` in the header location line when both exist. If `sector_reference` exists, it MUST display it below the header line as "Sector: {sector_reference}". `location_text` MUST continue to display as the narrative description in the Ubicación tab. `street_address` MUST NOT appear in the public UI.

#### Scenario: Detail with full structured location
- GIVEN a property with `municipality = "Melipilla"`, `region_name = "Región Metropolitana de Santiago"`, `sector_reference = "Lo Chacón"`, `location_text = "a 5 min del centro"`
- WHEN the detail page renders
- THEN the header shows "Melipilla · Región Metropolitana de Santiago"
- AND the header shows "Sector: Lo Chacón" below
- AND the Ubicación tab shows "a 5 min del centro"

#### Scenario: Detail fallback
- GIVEN a property with all four new fields null
- WHEN the detail page renders
- THEN the header shows `location_text || "Ubicación por confirmar"`
- AND the Ubicación tab shows the same as before

### Requirement: PropertyDetailTabs Structured Location
`PropertyDetailTabs` MUST accept and display `municipality`, `region_name`, and `sector_reference` when available, in addition to the existing `locationText` narrative field.

#### Scenario: Tabs with structured location
- GIVEN `municipality = "Melipilla"`, `region_name = "Región Metropolitana de Santiago"`, `sector_reference = "Lo Chacón"`
- WHEN the Ubicación tab renders
- THEN it shows the structured location block above the map
- AND the map remains unchanged

## Constraints
| ID | Constraint |
|----|------------|
| C1 | No new dependencies installed. |
| C2 | `location_text` MUST NOT be removed, deprecated, or have its DB type changed. |
| C3 | All four new columns MUST be nullable. |
| C4 | No schema changes to `highlights` or other unrelated tables. |
| C5 | No changes to authentication, RLS, or Service Role Key logic. |
| C6 | Existing Supabase clients (`server-supabase.ts`, `supabaseClient.ts`) MUST be respected. |
| C7 | Public filtering by comuna/region is out of scope for this change. |
| C8 | `street_address` MUST NOT appear in public UI except in JSON-LD. |

## Architecture Decisions
| Decision | Rationale |
|----------|-----------|
| Keep `location_text` as narrative field | Preserves existing UX and allows free-text descriptions alongside structured data. |
| English column names (`municipality`, `region_name`, etc.) | Aligns with user-executed Supabase migration and avoids mixed-language schema. |
| Spanish UI labels (Comuna, Región, Sector, Dirección) | Matches user-facing language expectations. |
| Manual data migration only | Avoids risky automated parsing of free-text into structured fields. |
| Auto-complete region from municipality | Reduces admin friction while allowing manual override for edge cases. |

## Affected Files
| File | Action | Description |
|------|--------|-------------|
| `src/types/property.ts` | Modify | Add four fields to `Property` and `PropertyFormPayload` |
| `src/lib/property-form.ts` | Modify | Add four fields to `PropertyFormValues` and `toPropertyPayload` |
| `src/components/PropertyFormFields.tsx` | Modify | Add structured location inputs section |
| `src/app/admin/propiedades/[id]/route.ts` | Modify | Persist four fields in PATCH handler |
| `src/app/propiedades/[slug]/page.tsx` | Modify | Metadata + JSON-LD + detail header display |
| `src/components/PropertyCard.tsx` | Modify | Prefer `municipality` over `location_text` |
| `src/app/page.tsx` | Modify | Homepage card location display fallback |
| `src/app/admin/propiedades/nueva/page.tsx` | Modify | Initial form state includes new fields |
| `src/app/admin/propiedades/[id]/editar/EditPropertyForm.tsx` | Modify | Seed and submit new fields |
| `src/app/admin/dashboard/page.tsx` | Modify | Display structured location or fallback |
| `src/components/PropertyDetailTabs.tsx` | Modify | Accept and display structured location props |

## Validation Criteria
- [ ] The four columns exist in Supabase and are nullable.
- [ ] The `Property` type in TypeScript includes `municipality`, `region_name`, `sector_reference`, `street_address`.
- [ ] The admin form shows the four fields with municipality select and region auto-complete.
- [ ] Creating/editing a property persists the four fields in Supabase.
- [ ] Properties without new fields render identically to before.
- [ ] `PropertyCard` displays `municipality` when present, `location_text` otherwise.
- [ ] The detail page shows `municipality · region_name` and `sector_reference` when present.
- [ ] The JSON-LD uses structured fields when present (see SEO spec).
- [ ] The admin dashboard shows structured location or fallback.
- [ ] The homepage cards show structured location or fallback.
- [ ] The map Leaflet was not modified.
- [ ] No new dependencies installed.
- [ ] No authentication, RLS, or Service Role Key logic changed.
