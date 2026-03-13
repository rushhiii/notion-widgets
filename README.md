![Notion Widgets Banner](https://raw.githubusercontent.com/rushhiii/notion-widgets/refs/heads/main/public/icons/repo_banner_new.png)

<!-- ✱ ✻ ✷ ✮-->
# ✮ Notion Widgets Framework
Production-ready, static Notion widgets built with Next.js App Router, TypeScript, and Tailwind CSS. Includes flick-style clock/timer/stopwatch widgets and quote cards that can sync from your Notion database.
> _Inspiration: [Gluqlo flip clock screensaver](https://www.omgubuntu.co.uk/2016/11/gluqlo-flipqlo-screensaver-ubuntu)._

[![Notion](https://img.shields.io/badge/Notion-Platform-111827?style=flat-square&labelColor=0f0f11&logo=notion&logoColor=white)](https://www.notion.so/)
[![Next.js](https://img.shields.io/badge/Next.js-Framework-111827?style=flat-square&labelColor=0f0f11&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-Library-0a7ea4?style=flat-square&labelColor=0f0f11&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-2563eb?style=flat-square&labelColor=0f0f11&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Utility-06b6d4?style=flat-square&labelColor=0f0f11&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Hosting-111827?style=flat-square&labelColor=0f0f11&logo=vercel&logoColor=white)](https://vercel.com/)
[![Live Clock](https://img.shields.io/badge/Clock-Live-7c3aed?style=flat-square&labelColor=111827&logo=clockify&logoColor=white)](https://rushis-notion-widgets.vercel.app/clock)
[![Timer](https://img.shields.io/badge/Timer-Live-2563eb?style=flat-square&labelColor=111827&logo=sandwatch&logoColor=white)](https://rushis-notion-widgets.vercel.app/timer)
[![Stopwatch](https://img.shields.io/badge/Stopwatch-Live-0f766e?style=flat-square&labelColor=111827&logo=tempo&logoColor=white)](https://rushis-notion-widgets.vercel.app/stopwatch)
[![Quotes](https://img.shields.io/badge/Quotes-Live-9333ea?style=flat-square&labelColor=111827&logo=quip&logoColor=white)](https://rushis-notion-widgets.vercel.app/quotes)
[![D-Day](https://img.shields.io/badge/D--Day-Live-f59e0b?style=flat-square&labelColor=111827&logo=counter-strike&logoColor=white)](https://rushis-notion-widgets.vercel.app/dday)
[![View Repo](https://img.shields.io/badge/View%20Repo-1f6feb?style=flat-square&labelColor=111827&logo=github&logoColor=white)](https://github.com/rushhiii/notion-widgets)


## Table of Contents

- [Notion Widgets Framework](#notion-widgets-framework)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Deployment (Vercel)](#deployment-vercel)
- [Notion Embed](#notion-embed)
- [Query Parameters](#query-parameters)
	- [Clock Widget (`/clock`)](#clock-widget-clock)
	- [Timer Widget (`/timer`)](#timer-widget-timer)
	- [Stopwatch Widget (`/stopwatch`)](#stopwatch-widget-stopwatch)
	- [Quotes Widget (`/quotes`)](#quotes-widget-quotes)
	- [D-Day Widget (`/dday`)](#d-day-widget-dday)
	- [Weather Widget (`/weather`)](#weather-widget-weather)
- [Notion Quotes Database Sync](#notion-quotes-database-sync)
- [Deploy Your Own (Vercel Quickstart)](#deploy-your-own-vercel-quickstart)
- [Adding a New Widget](#adding-a-new-widget)
- [Notes](#notes)

## Features

- Clock, Timer, Stopwatch, Quotes, and D-Day widgets (separate routes)
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
	dday/page.tsx
	quotes/page.tsx
components/
	widgets/
		ClockWidget.tsx
		TimerWidget.tsx
		StopwatchWidget.tsx
		DdayWidget.tsx
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
5. In Vercel project Settings → Environment Variables, add `NEXT_PUBLIC_OPENWEATHER_API_KEY` with your OpenWeather key (Production and Preview). For local dev, add it to `.env.local` and restart dev.
6. Deploy.

Widget URLs (once deployed):

- `https://your-app.vercel.app/clock`
- `https://your-app.vercel.app/timer`
- `https://your-app.vercel.app/stopwatch`
- `https://your-app.vercel.app/dday`
- `https://your-app.vercel.app/quotes`
- `https://your-app.vercel.app/weather`

Live examples (replace host with yours):

- `/clock?tz=America/Toronto&format=24&theme=purple`
- `/clock?tz=Europe/London&format=12&theme=default&seconds=true`
- `/timer?t=15:00&theme=teal`
- `/stopwatch?start=1&theme=sunset`
- `/dday?date=2026-07-20&units=1&seconds=1&week=1&month=1&year=1&dayColor=green`
- `/quotes?category=focus&theme=light&source=notion&rotate=true&interval=8`
- `/weather?location=Toronto&units=metric`

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

### D-Day Widget (`/dday`)

- `date`: target date (e.g., `2026-07-20`)
- Toggles (true/false): `day`, `week`, `month`, `year`, `hours`, `minutes`, `seconds`, `totalseconds`, `megaseconds`
- Bulk display control: `display=all|unit1,unit2`, `notdisplay=unit1,unit2`
- `units`: quick-enable extra units (defaults off unless set)
- Color overrides (palette key or hex): `color` (global), `dayColor`, `weekColor`, `monthColor`, `yearColor`, `timeColor`, `hoursColor`, `minutesColor`, `secondsColor`, `totalColor`, `megaColor`, `overviewColor`, `titleColor`
- Date heading: `showdate=true/false` (default true)
- Overview mode: `mode=overview` shows a single combined badge with days/weeks/months/years/hours/minutes/seconds/microseconds
- Alignment: `align=left|center|right`
- Background: `bg`/`background` (palette or hex). Use `%23` to encode `#` in URLs (e.g., `%232F0601`).
- Custom note: `note=Your%20text` renders just below the date heading.

Examples:

- `/dday?date=2026-12-31&units=1&seconds=1&week=1&month=1&year=1&dayColor=green`
- `/dday?date=2027-05-10&day=1&week=0&hours=1&minutes=1&seconds=1&timeColor=0d9488`
- `/dday?display=all&notdisplay=hours,minutes&color=blue&titleColor=gold&showdate=1`
- `/dday?mode=overview&date=2026-03-11&overviewColor=purple&align=center`
- `/dday?day=1&hours=1&minutes=1&seconds=1&timeColor=0d9488&totalseconds=1&megaseconds=1&units=1&weeks=1&months=1&years=1&bg=%232F0601&titleColor=gold&note=Started%20Dec%208%2C%202025`

### Weather Widget (`/weather`)

- Location: `location`/`q` (city), or `lat` + `lon`
- Units: `units=metric|imperial` (default metric)
- Mode: `mode=minimal|detail` (default minimal). Minimal shows location, icon, temp, and condition.
- Details toggle: `details=true/false` (default true in detail mode, false in minimal unless enabled)
- Colors/themes: presets via `theme=mint|sand|dusk|sky`; overrides with `bg`, `text`, `accent`
- Alignment: `align=left|center|right` (default center)
- Page background: `pagebg=true|1` to match the entire page background to the widget `bg`; omit/false keeps the page transparent (only the card colored)

Examples:

- `/weather?location=Toronto&units=metric`
- `/weather?location=Toronto&units=metric&mode=minimal&theme=mint`
- `/weather?lat=40.4168&lon=-3.7038&units=metric&bg=eaf1ec&accent=10b981&mode=detail`
- `/weather?location=Seattle&units=imperial&details=0&align=right&theme=dusk`
- `/weather?location=Berlin&theme=sky&pagebg=1` (match page background to the sky preset)

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