# Copilot Instructions

## Documentation Source
- Always use Context7 MCP to verify the latest Next.js syntax and APIs before generating code.

---

## Tech Stack (DO NOT CHANGE)

- Next.js (App Router)
- TypeScript (strict mode)
- Supabase (Auth, Database, Storage)
- PostgreSQL with Row Level Security (RLS)
- TailwindCSS
- shadcn/ui
- Sonner (for toast notifications)
- UUID for file naming
- Storage bucket: property-images

Do not introduce new libraries unless explicitly requested.

---

## Architecture Rules

- Use App Router conventions (app directory).
- Use Server Components by default.
- Use "use client" only when strictly necessary.
- Never export `revalidate` (or similar cache directives) from files marked with `"use client"`; those belong in server components or layout files.
- Keep business logic outside UI components when possible.
- Storage logic must stay inside `/lib/storage.ts`.
- Supabase client must be imported from `/lib/supabaseClient`.
- Database mutations that need to bypass RLS or require elevated privileges (e.g. deleting arbitrary rows) must be implemented in a **server route/action** using the service‑role key, and the route should verify the authenticated session. Never perform those operations directly from client components.

---

## Database & Security Rules

- Never bypass Row Level Security.
- Assume RLS is enabled at all times.
- Always fetch the authenticated user before sensitive operations.
- Never expose service role keys in frontend code.
- Use property `id` (UUID) for storage folder paths.
- Never use slug as a storage reference.
- In admin route handlers, use `/lib/server-supabase.ts` (`createRouteSupabaseClient`) instead of rebuilding cookie/client setup inline.
- In admin route handlers, use `/lib/admin-auth.ts` (`requireAdminUser`) for authentication/authorization checks instead of duplicating guard logic.

---

## Storage Rules

- Use UUID for file names.
- Do not overwrite files (upsert: false).
- Validate MIME type before upload.
- Validate file size (max 5MB).
- Folder structure must be:
  propertyId/uuid.extension

---

## UX Rules

- Always show toast feedback on success or error.
- Use loading states (spinners) for async actions.
- Disable buttons during async operations.
- Do not use alert().
- All UI must be mobile-first.
- Use Tailwind responsive breakpoints (sm, md, lg, xl).
- Avoid fixed widths unless necessary.
- Ensure touch-friendly UI elements.
- Prevent horizontal scrolling on mobile.

---

## Code Style

- Use async/await.
- Avoid unnecessary try/catch nesting.
- Keep functions small and focused.
- Use descriptive variable names.
- Do not generate overly abstract patterns unless requested.

---

## API Response Rules

- In route handlers, always use shared response helpers from `/lib/api-response.ts`.
- Use `jsonError(message, status, meta?)` for error responses.
- Use `jsonSuccess(meta?, status?)` for successful responses.
- Do not return manual `NextResponse.json({ error: ... })` or manual success payloads when these helpers apply.
- Keep API status codes and error messages standardized using shared constants from `/lib/constants.ts`.

---

## SEO Rules

- Slug is used only for SEO.
- Never use slug as primary identifier.
- Never regenerate slug in a way that breaks references.

---

## Performance Rules

- Avoid unnecessary client-side data fetching.
- Prefer server actions when appropriate.
- Avoid re-render loops.
- Use dynamic imports only when needed.

---

## What NOT to Do

- Do not introduce Redux or global state libraries.
- Do not change folder structure.
- Do not modify database schema unless explicitly asked.
- Do not use class components.
- Do not generate unnecessary boilerplate.