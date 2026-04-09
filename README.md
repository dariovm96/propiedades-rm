This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Configure these variables in your `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS` (comma-separated allowed admin emails for `/admin` routes)

Example:

`ADMIN_EMAILS=owner@empresa.com,soporte@empresa.com`

Notes:

- `ADMIN_EMAIL` is still supported as a fallback for backwards compatibility.

## Testing

Standard test runner is **Vitest**.

- `npm run test`: run all tests once (non-watch)
- `npm run test:watch`: local interactive watch mode
- `npm run test:ci`: deterministic non-interactive gate for CI/verify (**source of truth**)

For new guardrails, prefer Vitest APIs (`describe`, `it`, `expect`) and `@/...` imports.

## Security Gates (CI)

- `npm run security:audit`: runs dependency audit for production dependencies and fails on `high`/`critical` findings.
- `npm run security:exceptions`: validates `.github/security-exceptions.yaml` and fails if any exception is missing traceability metadata (`owner`, `evidence`) or has expired `expiry`.
- `.github/workflows/quality.yml` includes a blocking `security-gates` job for:
  - dependency audit (`npm run security:audit`)
  - security exceptions validation (`npm run security:exceptions`)
  - secret scanning (`gitleaks/gitleaks-action@v2`)

## Security Hardening Runbook

- Operational checklist for pre-production, post-deploy, rollback, ownership and no-visual-impact evidence:
  - `docs/security-hardening-checklist.md`
- Evidence log used to close verify gaps (visual parity + CI gates execution proof):
  - `docs/security-hardening-evidence.md`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
