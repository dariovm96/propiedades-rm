# Tasks: Implementación SEO para Propiedades RM

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180–220 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Dynamic metadata + shared query | PR 1 | Single PR; includes all phases |
| 2 | Static metadata + discovery files | PR 1 | Same PR, sequential commits |
| 3 | Schema.org + env verification | PR 1 | Same PR, final commits |

## Phase 1: Foundation — Shared Query Helper

- [ ] 1.1 Create `src/lib/property-queries.ts` with `getPropertyBySlug(slug)` using `supabase.ts` (public client). Return `Property | null`.
- [ ] 1.2 Refactor `src/app/propiedades/[slug]/page.tsx` to import `getPropertyBySlug` instead of inline query. Remove duplicated `supabase.from(...)` logic. No functional changes.

## Phase 2: Dynamic Property Metadata

- [ ] 2.1 Add `generateMetadata({ params })` to `src/app/propiedades/[slug]/page.tsx`. Use `getPropertyBySlug`.
- [ ] 2.2 Implement title inference: type + area + operation + location + "| Propiedades RM". Defensive fallback to `property.title` if fields are missing.
- [ ] 2.3 Implement dynamic description from property data (title, location, area, price).
- [ ] 2.4 Add `openGraph.images` with `getPublicImageUrl(images[0])` if `images.length > 0`; otherwise omit `og:image`.
- [ ] 2.5 Add `alternates.canonical` pointing to `https://${NEXT_PUBLIC_SITE_URL}/propiedades/${slug}`.
- [ ] 2.6 Add fallback metadata when `getPropertyBySlug` returns `null` (generic metadata, no `notFound` throw in `generateMetadata`).

## Phase 3: Static Page Metadata

- [ ] 3.1 Export `metadata` object in `src/app/page.tsx` with title "Propiedades RM – Terrenos, Parcelas y Casas en Melipilla" and optimized description.
- [ ] 3.2 Export `metadata` object in `src/app/propiedades/page.tsx` with title "Propiedades en venta y arriendo – Melipilla | Propiedades RM" and optimized description.

## Phase 4: Dynamic Sitemap

- [ ] 4.1 Create `src/app/sitemap.ts` exporting `sitemap()` returning `MetadataRoute.Sitemap`.
- [ ] 4.2 Query `properties` (slug, status, created_at) with `supabase.ts`. Filter `status = 'available'`.
- [ ] 4.3 Build entries: `/` (priority 1.0), `/propiedades` (priority 0.8), `/propiedades/{slug}` (priority 0.6, changefreq weekly).
- [ ] 4.4 Use `NEXT_PUBLIC_SITE_URL` with fallback to `https://localhost:3000`. Do NOT export `revalidate`.

## Phase 5: Robots.txt

- [ ] 5.1 Create `src/app/robots.ts` exporting `robots()` returning `MetadataRoute.Robots`.
- [ ] 5.2 Configure rules: `userAgent: '*', allow: '/', disallow: '/admin/'`.
- [ ] 5.3 Reference sitemap at `https://${NEXT_PUBLIC_SITE_URL}/sitemap.xml`.

## Phase 6: JSON-LD Schema.org

- [ ] 6.1 In `src/app/propiedades/[slug]/page.tsx`, inject `<script type="application/ld+json">` with `dangerouslySetInnerHTML` using already-loaded `property` data.
- [ ] 6.2 Build `RealEstateListing` schema. Include `name`, `description`, `url`.
- [ ] 6.3 Conditionally include `price` (omit if `null`), `floorSize` with `unitCode: "MTK"` (omit if `area_m2` null), `image` array (omit if `images.length === 0`), `address` (omit if `location_text` null).
- [ ] 6.4 Ensure `JSON.stringify` is used with `safe` serialization. No second query.

## Phase 7: Verification & Environment

- [ ] 7.1 Create `.env.example` with `NEXT_PUBLIC_SITE_URL=https://localhost:3000` (fallback) and document production requirement.
- [ ] 7.2 Verify checklist: `generateMetadata` unique per property, `og:image` valid or omitted, `/sitemap.xml` accessible with only `available`, `/robots.txt` blocks `/admin/`, JSON-LD present in `<head>`, no duplicate queries, no broken existing behavior.
