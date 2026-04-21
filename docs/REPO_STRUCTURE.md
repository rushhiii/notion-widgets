# Repository Structure

This project uses Next.js App Router with route-per-widget pages and reusable widget components.

## Top-Level

- `app/`: Route handlers and pages
- `components/`: Shared UI wrappers and widget implementations
- `lib/`: Reusable utilities and quote datasets
- `public/`: Static assets (icons, fonts, README images)
- `scripts/`: Local scripts (quote sync, seeding, migration)
- `types/`: Type declarations

## App Layout

- `app/layout.tsx`: Global layout and site metadata
- `app/page.tsx`: Landing page
- `app/<widget>/page.tsx`: Public widget routes
- `app/api/`: API routes (cron, translation, weather, auth updates)
- `app/prvt/`: Private/admin area (excluded from search indexing)

## Widget Pattern

Public widgets generally follow one of these patterns:

1. Simple widget page:
- `app/timer/page.tsx`
- Uses a component from `components/widgets/`

2. Builder + client wrapper + widget:
- `app/quotes/page.tsx`
- `app/quotes/Builder.tsx` and/or `app/quotes/ClientView.tsx`
- `components/widgets/QuoteWidget.tsx`

## Quote Sync Flow

1. `scripts/sync-notion-quotes.mjs` pulls quotes from Notion.
2. Data is written to `lib/quotes.notion.json`.
3. `lib/quotes.ts` serves Notion quotes with fallback local quotes.
4. On Vercel, `buildCommand` runs quote sync before build.

## Recommended Conventions

- Keep route metadata (`title`, `description`, icon) near each page.
- Put shared pure helpers in `lib/`.
- Keep query-param parsing close to the widget/builder that uses it.
- When adding new public pages, include them in `app/sitemap.ts`.
- When adding private pages, keep them under `app/prvt/`.
