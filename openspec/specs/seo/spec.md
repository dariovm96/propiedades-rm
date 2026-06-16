# Delta for SEO

## Purpose
Extend existing SEO metadata and JSON-LD to use structured location fields (`municipality`, `region_name`) when available, with mandatory fallback to `location_text` for zero regression on existing records.

## MODIFIED Requirements

### Requirement: Dynamic Property Metadata (Fase 1)
The page `/propiedades/[slug]` MUST export `generateMetadata` that prefers `municipality` for the city segment when it exists, and falls back to `location_text` or `"Melipilla"`. The description MUST include `municipality` and `region_name` when both exist, and MUST fall back to the current `location_text` behavior when they do not.
(Previously: `city` was derived from `location_text` only with fallback to `"Melipilla"`; description appended `location_text` only.)

#### Scenario: Happy path — property with structured location
- GIVEN a property with `municipality = "Melipilla"`, `region_name = "Región Metropolitana de Santiago"`, `sector_reference = "Lo Chacón"`, `area_m2 = 5000`, `status = "available"`, `price = 45000000`
- WHEN `generateMetadata` is called
- THEN the title is "Terreno 5.000 m² en venta en Melipilla | Propiedades RM"
- AND the description is "Terreno de 5.000 m² disponible en Melipilla, Región Metropolitana. Sector Lo Chacón. Precio: $45.000.000 CLP."

#### Scenario: Fallback — property with only location_text
- GIVEN a property with `municipality = null`, `region_name = null`, `location_text = "cerca del centro de Melipilla"`
- WHEN `generateMetadata` is called
- THEN the title uses `location_text` or `"Melipilla"` as before
- AND the description appends `location_text` as before
- AND the output is identical to the pre-change behavior

#### Scenario: Edge — partial structured data (municipality without region)
- GIVEN a property with `municipality = "Melipilla"`, `region_name = null`, `sector_reference = null`
- WHEN `generateMetadata` is called
- THEN the title uses `municipality`
- AND the description includes `municipality` without region or sector

### Requirement: JSON-LD Structured Data (Fase 5)
The property detail page MUST inject a `<script type="application/ld+json">` with Schema.org `RealEstateListing`. The `address` object MUST include `addressLocality` from `municipality` when present, falling back to `location_text`, and MUST include `addressRegion` from `region_name` when present, and MUST include `streetAddress` from `street_address` when present. `addressCountry` MUST be `"CL"`.
(Previously: `address` only included `addressLocality` from `location_text` and `addressCountry: "CL"` when `location_text` was non-null.)

#### Scenario: Full structured JSON-LD
- GIVEN a property with `municipality = "Melipilla"`, `region_name = "Región Metropolitana de Santiago"`, `street_address = "Camino Lo Chacón 150"`, `location_text = "sector Lo Chacón"`
- WHEN the page renders
- THEN the JSON-LD `address` contains `addressLocality: "Melipilla"`, `addressRegion: "Región Metropolitana de Santiago"`, `streetAddress: "Camino Lo Chacón 150"`, `addressCountry: "CL"`
- AND `location_text` is NOT used for `addressLocality`

#### Scenario: Fallback JSON-LD
- GIVEN a property with `municipality = null`, `region_name = null`, `street_address = null`, `location_text = "cerca del centro"`
- WHEN the page renders
- THEN the JSON-LD `address` contains `addressLocality: "cerca del centro"`, `addressCountry: "CL"`
- AND `addressRegion` and `streetAddress` are omitted

#### Scenario: Partial structured JSON-LD
- GIVEN a property with `municipality = "Melipilla"`, `region_name = null`, `street_address = null`
- WHEN the page renders
- THEN the JSON-LD `address` contains `addressLocality: "Melipilla"`, `addressCountry: "CL"`
- AND `addressRegion` and `streetAddress` are omitted

## Constraints
| ID | Constraint |
|----|------------|
| C1 | No new dependencies installed. |
| C2 | `location_text` MUST NOT be removed or deprecated. |
| C3 | All RSC queries MUST use the existing shared `getPropertyBySlug()`; no second Supabase query. |
| C4 | If the existing query uses `.select()` with explicit columns, the four new fields MUST be added. |
| C5 | One file at a time: implement, diff, confirm. |

## Architecture Decisions
| Decision | Rationale |
|----------|-----------|
| Prefer structured fields for SEO metadata | Improves structured data quality and search ranking for location queries. |
| Mandatory fallback to `location_text` | Guarantees zero regression for existing records that have not been manually migrated. |
| Include `street_address` in JSON-LD only | Not displayed publicly; used only for search engine structured data richness. |

## Affected Files
| File | Action | Phase |
|------|--------|-------|
| `src/app/propiedades/[slug]/page.tsx` | Modify | Metadata + JSON-LD |

## Dependencies
- `NEXT_PUBLIC_SITE_URL` must remain defined in production environment.
- `getPublicImageUrl` helper must remain working without auth.
- Existing `revalidate = 60` behavior must remain intact.

## Validation Criteria
- [ ] `generateMetadata` uses `municipality` when present and falls back to `location_text`.
- [ ] JSON-LD `address` uses `municipality` for `addressLocality` and `region_name` for `addressRegion` when present.
- [ ] Properties without new fields render identically to before.
- [ ] No duplicate Supabase queries are introduced.
- [ ] No existing behavior (ISR, images, pagination, auth) is broken.
