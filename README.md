# Notion Widgets Framework

![Notion Widgets Banner](https://raw.githubusercontent.com/rushhiii/notion-widgets/refs/heads/main/public/icons/repo_banner.png)

![Notion](https://img.shields.io/badge/Notion-black?logo=notion&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-111?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-0a7ea4?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06b6d4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white)

Production-ready, static Notion widgets built with Next.js App Router, TypeScript, and Tailwind CSS. Includes flick-style clock/timer/stopwatch widgets and quote cards that can sync from your Notion database.

Inspiration: [Gluqlo flip clock screensaver](https://www.omgubuntu.co.uk/2016/11/gluqlo-flipqlo-screensaver-ubuntu).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Deployment (Vercel)](#deployment-vercel)
- [Notion Embed](#notion-embed)
- [Query Parameters](#query-parameters)
	- [Clock](#clock-widget-clock)
	- [Timer](#timer-widget-timer)
	- [Stopwatch](#stopwatch-widget-stopwatch)
	- [Quotes](#quotes-widget-quotes)
- [Notion Quotes Database Sync](#notion-quotes-database-sync)
- [Adding a New Widget](#adding-a-new-widget)
- [Deploy Your Own (Vercel Quickstart)](#deploy-your-own-vercel-quickstart)
- [Notes](#notes)

## Features

- Clock, Timer, Stopwatch, and Quotes widgets (separate routes)
- Multiple themes (default, light, purple, teal, sunset, theme1–theme8)
- Static-compatible (no backend) and iframe-safe for Notion embeds
- URL query customization for layout, theme, and behavior
- Responsive, fixed-height containers with transparent-friendly backgrounds

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Vercel (free hosting)

## Project Structure

```txt
app/
	clock/page.tsx
	timer/page.tsx
	stopwatch/page.tsx
	quotes/page.tsx
components/
	widgets/
		ClockWidget.tsx
		TimerWidget.tsx
		StopwatchWidget.tsx
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

1. Push this repository to GitHub (or your fork).
2. In Vercel, import the repo.
3. Build command: `npm run build` (sync script is optional; see Notion sync section).
4. Output: handled by Next.js.
5. Deploy.

Widget URLs (once deployed):

- `https://your-app.vercel.app/clock`
- `https://your-app.vercel.app/timer`
- `https://your-app.vercel.app/stopwatch`
- `https://your-app.vercel.app/quotes`

Live examples (replace host with yours):

- `/clock?tz=America/Toronto&format=24&theme=purple`
- `/clock?tz=Europe/London&format=12&theme=default&seconds=true`
- `/timer?t=15:00&theme=teal`
- `/stopwatch?start=1&theme=sunset`
- `/quotes?category=focus&theme=light&source=notion&rotate=true&interval=8`

If using Notion-synced quotes, run `npm run sync:quotes` before each deploy/build to refresh `lib/quotes.notion.json`.

## Notion Embed

1. In Notion, type `/embed`.
2. Paste a widget URL (with optional query parameters).
3. Resize the embed block in Notion as needed.

## Query Parameters

### Clock Widget (`/clock`)

- `tz`: IANA timezone (default: `America/Toronto`)
- `format`: `12` or `24` (default: `12`)
- `theme`: any from `theme.ts` (default, light, purple, teal, sunset, theme1–theme8)
- `seconds`: `true/false` (default: `false`)
- `controls`: `true/false` to show settings panel (default: `false`)
- `size`: `25–120` (percentage scale; default: `85`)

Examples:

- `/clock?tz=America/Toronto&format=24&theme=purple`
- `/clock?tz=Europe/London&format=12&theme=default&seconds=true`

### Timer Widget (`/timer`)

- `t`: duration as `MM:SS` (default: `15:00` if omitted)
- `start`: `true/false` auto-start (default: `false`)
- `theme`: any from `theme.ts`
- `size`: `25–120` (default: `85`)
- `controls`: `true/false` to show settings panel (default: `false`)

Example: `/timer?t=05:00&start=true&theme=teal`

### Stopwatch Widget (`/stopwatch`)

- `t`: initial time as `HH:MM:SS` or `MM:SS` (default: `00:00:00`)
- `start`: `true/false` auto-start (default: `false`)
- `theme`: any from `theme.ts`
- `size`: `25–120` (default: `85`)
- `controls`: `true/false` to show settings panel (default: `false`)

Example: `/stopwatch?start=1&t=00:10:00&theme=purple`

### Quotes Widget (`/quotes`)

- `category`: e.g., `stoic` | `focus` | `growth` | `mindfulness` (optional)
- `theme`: any from `theme.ts`
- `source`: `auto` | `local` | `notion` (default: `auto`)
- `mode`: `daily` (quote of the day) | `random` (default: `daily`)
- `rotate`: `true/false` (default: `false`)
- `interval`: seconds between rotations (default: `10`)
- Colors (hex): `bg`, `border`, `text`, `accent`

Examples:

- `/quotes?category=stoic&theme=light`
- `/quotes?category=focus&theme=dark&source=notion&rotate=true&interval=8`
- `/quotes?mode=daily&bg=0b0b0b&border=7c3aed&text=f5f5f5&accent=a1a1aa`
- `/quotes?mode=random&source=local&theme=purple`

Use cases:
- Quote of the day on dashboards: `/quotes?mode=daily&source=notion&theme=dark`
- Brand-matched card colors: `/quotes?bg=111827&border=7c3aed&text=e5e7eb&accent=9ca3af`
- Random inspiration button: `/quotes?mode=random&rotate=false`

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

## Deploy Your Own (Vercel Quickstart)

1. **Clone**: `git clone https://github.com/rushhiii/notion-widgets` (or fork first).
2. **Install deps**: `npm install`.
3. **Optional (Notion sync)**: create `.env.local` with `NOTION_TOKEN` and `NOTION_DATABASE_ID`, then run `npm run sync:quotes` locally if you want fresh Notion quotes baked in.
4. **Push to GitHub**: commit and push your clone/fork.
5. **Import to Vercel**: new project → import repo.
6. **Build command**: `npm run build` (no extra output config needed).
7. **Deploy**: Vercel will build and host for free on the hobby tier. Your widgets will be at `https://your-app.vercel.app/<widget>`.

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