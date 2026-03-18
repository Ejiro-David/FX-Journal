# Lazy But I Love Data (FX Journal V4)

Private, local-first forex trade journal focused on setup integrity, confluence analytics, and clean low-friction logging.

## Current status

- Entry + Review + History + Settings flows are live.
- Data persists in IndexedDB (trades + image blobs).
- App runs from a single `app.js` entry loaded directly by `index.html`.

## Core features

- Fast `Log Trade` workflow with:
  - auto timestamp capture
  - optional manual timestamp override
  - screenshot upload/paste (before/after)
  - strategy-aware confluence checklist
- Dynamic confluence maps by strategy:
  - required vs quality rules
  - integrity + grade inferred automatically
- Open-vs-closed trade history separation:
  - open trades sorted to top
  - list + gallery views
  - inline edit flow + guarded delete flow for closed trades
- Analytics:
  - 60-metric catalog across performance/risk/confluence/session/market/behavior
  - charts + tables
  - insight reel cards
- CSV export:
  - all trades
  - filtered trades

## Data model highlights

- `strategy`
- `present_confluences` (array)
- inferred fields:
  - `confluence_score`
  - `missing_confluences`
  - `required_missing_count`
  - `quality_missing_count`
  - `setup_integrity`
  - `setup_grade`
- timestamps:
  - `captured_at_utc`
  - `captured_at_local`
  - `timezone_offset_min`

## Storage

- IndexedDB DB: `lazyButDataV4`
- Stores:
  - `trades`
  - `images`
- Legacy localStorage test data wipe flag is retained for migration safety.
- Cloud sync queue/state is stored in localStorage keys:
  - `lazyButDataSyncQueueV1`
  - `lazyButDataSyncCursorV1`

## Project structure

```text
index.html
styles.css
app.js
supabase-setup.sql
README.md
smoke.spec.js
assets/
```

## Run locally

Use any static server from the project root:

```bash
python3 -m http.server 5174
```

Then open:

- `http://localhost:5174/index.html`

## Smoke test

Playwright smoke spec exists at `smoke.spec.js`.

If Playwright is installed in your environment:

```bash
npx playwright test smoke.spec.js
```

## Notes

- This is intentionally local-first and private by default.
- Supabase sync is now wired in app UI (`Settings > Cloud Sync`).
- Run `supabase-setup.sql` in Supabase SQL Editor before using cloud sync.
