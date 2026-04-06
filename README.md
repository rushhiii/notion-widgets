![Notion Widgets Banner](https://raw.githubusercontent.com/rushhiii/notion-widgets/refs/heads/main/public/icons/repo_banner_new.png)

# ✮ Notion Widgets Framework
Static, embeddable Notion widgets built with Next.js App Router, TypeScript, and Tailwind CSS.

Includes clock, timer, stopwatch, D-Day, quotes, weather, and progress widgets with URL-based customization.

[![Notion](https://img.shields.io/badge/Notion-Platform-111827?style=flat-square&labelColor=0f0f11&logo=notion&logoColor=white)](https://www.notion.so/)
[![Next.js](https://img.shields.io/badge/Next.js-Framework-111827?style=flat-square&labelColor=0f0f11&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-2563eb?style=flat-square&labelColor=0f0f11&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Utility-06b6d4?style=flat-square&labelColor=0f0f11&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Hosting-111827?style=flat-square&labelColor=0f0f11&logo=vercel&logoColor=white)](https://vercel.com/)

## What’s Included

- Clock, Timer, Stopwatch, Quotes, D-Day, Weather, and Progress widgets
- Static-compatible, iframe-safe embeds for Notion
- Theme, layout, color, and behavior customization through query params
- Responsive UI with transparent-friendly embeds

## Quick Start

```bash
npm install
npm run sync:quotes
npm run dev
```

Open `http://localhost:3000/clock` or `http://localhost:3000/quotes`.

## Fork & Deploy Your Own

1. **Fork the repo** on GitHub: https://github.com/rushhiii/notion-widgets

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/notion-widgets.git
   cd notion-widgets
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. (Optional) **Sync Notion quotes locally**:
   - Create `.env.local` with `NOTION_TOKEN` and `NOTION_DATABASE_ID`
   - Run `npm run sync:quotes`

5. **Test locally**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/clock` to verify.

6. **Push to your GitHub fork**:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

7. **Deploy to Vercel**:
   - Go to https://vercel.com and sign in
   - Click "Add New" → "Project"
   - Select your forked repo
   - Click "Deploy"

8. (Optional) **Add environment variables in Vercel**:
   - Go to project Settings → Environment Variables
   - Add `NEXT_PUBLIC_OPENWEATHER_API_KEY` if you use weather widgets
   - Redeploy for changes to take effect

Your widgets will be live at `https://YOUR_VERCEL_APP.vercel.app/clock`, `/timer`, etc.

## Widget Routes

- `/clock`
- `/timer`
- `/stopwatch`
- `/dday`
- `/quotes`
- `/weather`
- `/progress`
- `/music-player`

## Common Query Params

- Clock: `tz`, `format`, `seconds`, `theme`, `controls`, `size`
- Timer: `t`, `start`, `theme`, `controls`, `size`
- Stopwatch: `t`, `start`, `theme`, `controls`, `size`
- Quotes: `category`, `source`, `mode`, `rotate`, `interval`, `bg`, `border`, `text`, `accent`
- D-Day: `date`, `mode`, `align`, `showdate`, `bg`, `color`, `titleColor`, `dayColor`, `timeColor`
- Weather: `location`, `lat`, `lon`, `units`, `mode`, `details`, `theme`, `bg`, `text`, `accent`
- Progress: `title`, `label`, `goal`, `progress`, `prefix`, `suffix`, `accent`, `track`, `text`, `bg`, `embed`
- Music Player: `server`, `type`, `id`, `colorscheme`, `theme`, `loop`, `order`, `preload`, `volume`, `list-folded`, `list-max-height`, `storage-name`

## Music Player (English)

Powered by APlayer + MetingJS, supports both Netease and Tencent playlists/songs/albums/artists/search.

Examples:

- Tencent playlist:
   `https://notion.busiyi.world/music-player/?server=tencent&type=playlist&id=7888484143`
- Netease playlist with list height:
   `https://notion.busiyi.world/music-player/?server=netease&type=playlist&id=12528089157&list-max-height=96`
- Netease song with forced dark mode:
   `https://notion.busiyi.world/music-player/?server=netease&type=song&id=28285910&colorscheme=dark`

Options:

| option | default | description |
| --- | --- | --- |
| server | required | Music provider: `netease`, `tencent` |
| type | required | Type: `song`, `playlist`, `album`, `search`, `artist` |
| id | required | `song id`, `playlist id`, `album id`, `search keyword`, `artist id` |
| colorscheme | auto | `dark`, `light`, or auto (follow system) |
| theme | `#2980b9` | Primary accent color |
| loop | `all` | Loop mode: `all`, `one`, `none` |
| order | `list` | Play order: `list`, `random` |
| preload | `auto` | Preload mode: `none`, `metadata`, `auto` |
| volume | `0.7` | Default volume (overridden after manual adjustment) |
| list-folded | `false` | Fold playlist by default |
| list-max-height | `340px` | Playlist max height (numeric values treated as px) |
| storage-name | `metingjs` | localStorage key for player settings |

## Recent Updates

- D-Day builder now supports compact mode, default/dark/light theme handling, centered compact tiles, and separate title/text color controls.
- Progress widget now persists +/- edits in embedded mode across refreshes.
- Landing page typography and hero styling were updated to use Libre Baskerville for headings.
- CSS import typing issue in `app/layout.tsx` was fixed with a global declaration file.

## Notion Quotes Sync

1. Duplicate `.env.example` to `.env.local`.
2. Set `NOTION_TOKEN` and `NOTION_DATABASE_ID`.
3. Share your Notion database with the integration.
4. Run `npm run sync:quotes`.

## Contact / Requests

Open an issue or discussion for feature requests, collaboration ideas, or bugs.

## Notes

- No backend/database is required.
- Widgets are optimized for Vercel and Notion embeds.