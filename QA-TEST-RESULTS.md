# QA Notes - Edge Forge v2

## Current Focus

This document tracks the current Edge Forge v2 app.

## Performance Fixes To Validate

- Save button locks immediately after a valid submit.
- Double-clicking Save should not create duplicate trades.
- Trade save writes locally first and returns to History without waiting for Supabase.
- Cloud sync queue status appears in Settings.
- Offline or signed-out saves remain local and queue for later sync.
- Force Sync fetches cloud data before clearing local trades.

## Screenshot Flow To Validate

- First pasted image fills Before.
- After Before is set, the active target moves to After.
- A second pasted image fills After instead of replacing Before.
- Tapping/clicking Before intentionally makes Before the replacement target.
- Tapping/clicking After intentionally makes After the replacement target.
- Remove Before clears the whole screenshot pair.
- Remove After clears only After.
- Mobile tap-to-upload works for both Before and After.

## Process Flow To Validate

- A new trade cannot save without a non-empty opening journal entry.
- Every close path requires a non-empty closing journal entry and an explicit rules choice.
- Closed History rows show `Rules ✓`, `Rules ✗`, or `Unscored` for legacy records.
- Weekly adherence counts only scored live trades closed since local Monday 00:00.
- Week P&L remains unset until a week-start balance is saved for the current week.
- Two live wins or two live losses in one local day activate the red day-complete state.
- The red Log Trade control remains tappable; breakeven and backtest trades do not advance the breaker.

## Smoke Coverage

`smoke.spec.js` now targets the current Edge Forge DOM:

- `#fPair`
- `#fDirectionToggle`
- `#fEntryPrice`
- `#fMoodOpen`
- `#fImageInput`
- `#fSaveBtn`
- `#ctMoodClose`
- `#ctProcessToggle`
- `#tradeDetailModal`

## Known Test Environment Constraint

The installed Playwright version requires Node.js 18 or newer. The previous local shell reported Node.js 16.18.0, so Playwright cannot run there until Node is upgraded.
