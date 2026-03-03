# Notion Widgets Framework

Production-ready, static Notion widgets built with Next.js App Router, TypeScript, and Tailwind CSS.

Includes a flick-style clock UI and quote cards that can sync from your Notion quotes database.

## Features

- Modular widget architecture with isolated routes:
	- `/clock`
	- `/quotes`
- Fully static-compatible (no backend/database)
- Transparent iframe-safe backgrounds for Notion embeds
- Query-parameter customization per widget
- Responsive, fixed-height, no-scroll widget containers

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Vercel (free hosting)

## Project Structure

```txt
app/
	clock/page.tsx
	quotes/page.tsx
components/
	widgets/
		ClockWidget.tsx
		QuoteWidget.tsx
	ui/
		WidgetContainer.tsx
lib/
	quotes.ts
	utils.ts
```

## Local Development

```bash
npm install
npm run sync:quotes
npm run dev
```

Open `http://localhost:3000/clock` or `http://localhost:3000/quotes`.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. Go to Vercel and import the repo.
3. Use default build settings:
	 - Build command: `npm run build`
	 - Output: handled by Next.js static export config
4. Deploy.

Your widget URLs will be:

- `https://your-domain.vercel.app/clock`
- `https://your-domain.vercel.app/quotes`

If using Notion-synced quotes, run `npm run sync:quotes` before each deploy/build to refresh `lib/quotes.notion.json`.

## Notion Embed

1. In Notion, type `/embed`.
2. Paste a widget URL (with optional query parameters).
3. Resize the embed block in Notion as needed.

## Query Parameters

### Clock Widget (`/clock`)

- `tz`: IANA timezone (default: `America/Toronto`)
- `format`: `12` or `24` (default: `12`)
- `theme`: `light` | `dark` | `minimal` (default: `light`)
- `seconds`: `true/false` (default: `false`)
- `toggle`: `true/false` show in-widget seconds toggle button (default: `true`)

Examples:

- `/clock?tz=America/Toronto&format=24&theme=dark`
- `/clock?tz=America/Toronto&format=12&theme=dark&seconds=false&toggle=true`
- `/clock?tz=Europe/London&format=12&theme=minimal&seconds=true&toggle=false`

### Quotes Widget (`/quotes`)

- `category`: `stoic` | `focus` | `growth` | `mindfulness` (optional)
- `theme`: `light` | `dark` | `minimal` (default: `light`)
- `source`: `auto` | `local` | `notion` (default: `auto`)
- `rotate`: `true/false` (optional, default: `false`)
- `interval`: seconds between rotations (optional, default: `10`)

Examples:

- `/quotes?category=stoic&theme=light`
- `/quotes?category=focus&theme=dark&source=notion&rotate=true&interval=8`

## Notion Quotes Database Sync

1. Duplicate `.env.example` as `.env.local`.
2. Set:
	- `NOTION_TOKEN`
	- `NOTION_DATABASE_ID`
3. Share your Notion database with your integration.
4. Ensure your database has columns compatible with:
	- `text` (or `quote`, `content`) as title/rich_text
	- `author` as rich_text/title (optional)
	- `category` as select/rich_text (optional)
5. Run `npm run sync:quotes`.

The script writes normalized results to `lib/quotes.notion.json`, which keeps runtime fully static-compatible.

## Adding a New Widget

1. Create route: `app/<widget-name>/page.tsx`
2. Create component: `components/widgets/<WidgetName>.tsx`
3. Wrap the widget UI using `WidgetContainer`
4. Parse and validate query params via `useSearchParams` and helpers from `lib/utils.ts`
5. Keep background transparent and container height fixed for Notion compatibility

## Notes

- No backend/database is used.
- Widgets are static-compatible and optimized for Vercel.
- Design intentionally stays minimal and clean for embed use-cases.