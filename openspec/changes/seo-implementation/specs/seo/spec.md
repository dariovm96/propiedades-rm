# Delta for SEO

## Purpose
Add technical SEO to public pages (home, list, detail) and discovery files (sitemap, robots) without touching admin, client components, or Supabase schema.

## ADDED Requirements

### Requirement: Dynamic Property Metadata (Fase 1)
The page `/propiedades/[slug]` MUST export `generateMetadata` that returns a unique title, description, Open Graph image, and canonical URL per property. The query MUST be shared with the page component; a second Supabase query is NOT allowed. If the property does not exist, the function MUST return generic metadata without throwing.

#### Scenario: Happy path — property with full data
- GIVEN a property with `title`, `area_m2`, `status`, `location_text`, and `images[0]`
- WHEN `generateMetadata` is called
- THEN the title infers type + area + operation + location + "| Propiedades RM"
- AND `og:image` uses `getPublicImageUrl(images[0])`
- AND `alternates.canonical` points to `https://{NEXT_PUBLIC_SITE_URL}/propiedades/{slug}`

#### Scenario: Edge — missing image
- GIVEN a property with `images.length === 0`
- WHEN `generateMetadata` is called
- THEN `og:image` is omitted (no broken image URL)

#### Scenario: Edge — property not found
- GIVEN a slug that does not exist in the database
- WHEN `generateMetadata` is called
- THEN it returns generic fallback metadata without error

### Requirement: Static Page Metadata (Fase 2)
The homepage (`/`) and property list (`/propiedades`) MUST export static metadata objects with optimized titles and descriptions for Melipilla/La Estrella search intent.

#### Scenario: Homepage metadata
- GIVEN the route `/`
- WHEN the page renders
- THEN the title is "Propiedades RM – Terrenos, Parcelas y Casas en Melipilla"

#### Scenario: List page metadata
- GIVEN the route `/propiedades`
- WHEN the page renders
- THEN the title is "Propiedades en venta y arriendo – Melipilla | Propiedades RM"

### Requirement: Dynamic Sitemap (Fase 3)
The app MUST serve `/sitemap.xml` from `src/app/sitemap.ts` returning `MetadataRoute.Sitemap`. It MUST include `/`, `/propiedades`, and one entry per property with `status = 'available'` using `changefreq` and `priority` as specified. The site URL MUST come from `NEXT_PUBLIC_SITE_URL` with a dev fallback to `https://localhost:3000`. `revalidate` MUST NOT be used in the file.

#### Scenario: Sitemap with available properties
- GIVEN 3 properties with `status = 'available'` and 1 with `status = 'sold'`
- WHEN `/sitemap.xml` is requested
- THEN it returns entries for `/`, `/propiedades`, and the 3 available slugs
- AND the sold property is excluded

#### Scenario: Missing env variable
- GIVEN `NEXT_PUBLIC_SITE_URL` is undefined
- WHEN the sitemap is generated in development
- THEN it uses `https://localhost:3000` as the base URL

### Requirement: Robots.txt (Fase 4)
The app MUST serve `/robots.txt` from `src/app/robots.ts` using `MetadataRoute.Robots`. User-agent `*` MUST be allowed on `/` and disallowed on `/admin/`. The sitemap reference MUST point to `https://{NEXT_PUBLIC_SITE_URL}/sitemap.xml`.

#### Scenario: Crawl rules
- GIVEN `/robots.txt` is requested
- WHEN it is rendered
- THEN it contains `Disallow: /admin/` and `Sitemap: https://{NEXT_PUBLIC_SITE_URL}/sitemap.xml`

### Requirement: JSON-LD Structured Data (Fase 5)
The property detail page MUST inject a `<script type="application/ld+json">` with Schema.org `RealEstateListing`. It MUST use the same data already loaded by the page (no second query). Optional fields (`floorSize`, `price`, `image`) MUST be omitted when their source data is null or empty.

#### Scenario: Full JSON-LD
- GIVEN a property with `price`, `area_m2`, `location_text`, and `images`
- WHEN the page renders
- THEN the JSON-LD contains all fields including `floorSize` with `unitCode: "MTK"`

#### Scenario: Partial JSON-LD
- GIVEN a property with `price: null`, `area_m2: null`, and `images: []`
- WHEN the page renders
- THEN `price`, `floorSize`, and `image` are absent from the JSON-LD

## Constraints
| ID | Constraint |
|----|------------|
| C1 | No new dependencies installed. |
| C2 | No Supabase schema changes. |
| C3 | No client component modifications. |
| C4 | Admin logic (`src/app/admin/`) is untouched. |
| C5 | All RSC queries use `src/lib/supabase.ts` (public client). |
| C6 | One file at a time: implement, diff, confirm. |

## Architecture Decisions
| Decision | Rationale |
|----------|-----------|
| Use `supabase.ts` (public client) in RSC | Consistent with existing project pages; avoids a `server-supabase.ts` migration that is out of scope. |
| Share `getPropertyBySlug()` between `generateMetadata` and page component | Prevents duplicate Supabase queries on the same request. |
| Omit optional Schema.org fields instead of sending null/empty | Avoids invalid structured data and Google validation warnings. |

## Affected Files
| File | Action | Phase |
|------|--------|-------|
| `src/app/propiedades/[slug]/page.tsx` | Modify | 1, 5 |
| `src/app/page.tsx` | Modify | 2 |
| `src/app/propiedades/page.tsx` | Modify | 2 |
| `src/app/sitemap.ts` | Create | 3 |
| `src/app/robots.ts` | Create | 4 |
| `.env.example` | Create/Modify | 6 |

## Dependencies
- `NEXT_PUBLIC_SITE_URL` must be defined in production environment.
- `getPublicImageUrl` helper must remain working without auth.
- Existing `Property` type and `revalidate = 60` behavior must remain intact.

## Validation Criteria
- [ ] `generateMetadata` in `/propiedades/[slug]` returns unique title/description per property.
- [ ] `og:image` points to a valid Supabase Storage public URL (or is omitted).
- [ ] `/sitemap.xml` is accessible and lists only `available` properties.
- [ ] `/robots.txt` blocks `/admin/*` and references the sitemap.
- [ ] JSON-LD `RealEstateListing` is present in the `<head>` of property pages.
- [ ] No duplicate Supabase queries are introduced.
- [ ] No existing behavior (ISR, images, pagination, auth) is broken.
- [ ] `NEXT_PUBLIC_SITE_URL` is documented in `.env.example`.
