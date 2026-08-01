# Edge Forge v2

Private, local-first forex trade capture ledger for fast setup logging, screenshots, confluence review, and optional cloud sync.

## Current Status

- History, Log Trade, and Settings screens are live.
- Data persists locally first in IndexedDB.
- Save/delete actions update the UI from local state first; cloud sync runs in the background.
- Before/after screenshots can be uploaded by tap/click, drag/drop, or paste.
- Supabase sync is optional and requires the schema in `supabase-setup.sql`.
- Claude screenshot inference is present as an optional browser-side experiment, but manual logging remains the primary workflow.

## Core Features

- Fast trade capture:
  - pair, direction, entry price, lot size
  - required opening emotional-journal entry
  - optional SL/TP
  - before and after screenshots
  - strategy-aware confluence checklist
  - sessions and notes
- Strategy maps:
  - SMC confluences
  - ICC confluences
- Two Bullets support:
  - per-bullet lot sizing
  - B1/B2 outcomes
  - B2 target R:R
  - B2 stop-to-breakeven confirmation
- History:
  - status, strategy, mode, and pair filters
  - required closing journal and process score
  - weekly process adherence and week P&L from a saved week-start balance
  - non-blocking day-complete state after two wins or two losses
  - single-day, date-range, or all-history export
  - explicit All, Live, or Backtest export scope
  - CSV, JSON, or complete ZIP packages with screenshots
  - trade detail modal
  - edit and guarded delete
- Settings:
  - pairs and sessions
  - defaults
  - backtest mode
  - Supabase magic-link auth and force sync

## Data Model Highlights

- `pair`
- `direction`
- `entry_price`
- `sl_price`
- `tp_price`
- `lot_size`
- `strategy`
- `sessions`
- `confluences`
- `outcome`
- `pnl`
- `two_bullets`
- `b1_outcome`, `b1_pnl`
- `b2_outcome`, `b2_pnl`, `b2_target_rr`, `b2_stop_moved`
- `before_image_id`, `after_image_id`
- `process_clean`
- `mood_open`, `mood_close`
- `captured_at_utc`, `captured_at_local`, `closed_at_utc`
- `is_backtest`
- `needs_review`

## Storage

- IndexedDB DB: `edgeForgeV2`
- IndexedDB stores:
  - `trades`
  - `images`
- localStorage keys:
  - `edgeForgeSettingsV2`
  - `edgeForgeClaudeKey`
  - `edgeForgeSyncQueueV1`

## Run Locally

Use any static server from the project root:

```bash
python3 -m http.server 5174
```

Then open:

```text
http://localhost:5174/index.html
```

## Smoke Test

The Playwright smoke spec is `smoke.spec.js`.

```bash
npx playwright test smoke.spec.js
```

Playwright currently requires Node.js 18 or newer.

## Notes

- The app is intentionally local-first.
- Cloud sync should never block trade capture.
- Screenshots are stored as local blobs first, then uploaded to Supabase storage when sync is available.
- ZIP exports include `trades.json`, `trades.csv`, `image-manifest.json`, and date/trade-organized screenshots under `images/`. Missing cloud images are reported in the manifest instead of failing the whole export.
- The ZIP engine is vendored locally and loaded only when a complete package is requested.
- Process stats use live trades closed from local Monday 00:00 through the current time; legacy unscored trades are excluded from the adherence denominator.
