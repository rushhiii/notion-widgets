# Contributing

Thanks for helping improve Notion Widgets.

## Ground Rules

- Keep widget embed behavior stable. Query params should remain backward-compatible.
- Prefer small pull requests with one concern each.
- Do not commit generated or local-only files (`build/`, `.next/`, `.env.local`).
- Keep code style consistent with the file you are editing.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. (Optional) Sync Notion quotes if you have API credentials:

```bash
npm run sync:quotes
```

3. Start dev server:

```bash
npm run dev
```

## Before Opening a PR

Run:

```bash
npm run lint
npm run build
```

Also test these manually:

- Builder mode and embed mode for the route you changed
- At least one URL with query params copied from README examples
- Mobile width behavior for UI changes

## PR Checklist

- Clear title and summary of user-facing changes
- Screenshots/GIFs for UI updates
- Notes about added/changed query params
- Migration notes if behavior changed intentionally

## Commit Message Style

Use short, descriptive commit messages, for example:

- `feat(quotes): add secure manual sync trigger`
- `docs: add repo structure and cron setup guide`
- `fix(weather): correct page metadata title`

## Reporting Bugs

Please include:

- Route path (for example: `/quotes`)
- Full URL with query params
- Expected vs actual behavior
- Browser and device
- Screenshot if visual
