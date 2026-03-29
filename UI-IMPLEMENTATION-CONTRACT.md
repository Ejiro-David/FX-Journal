# Edge Forge UI Implementation Contract

## 1) Visual Intent and Color Governance

### System Rule
- Cyan is reserved for system and interaction feedback.
- Green and red are reserved for trade semantics only.
- All other UI remains monochrome.

### Allowed Accent Mapping
- Cyan (`#00e5ff`): machine/live states, focus rings, AI/system indicators.
- Green (`#22c55e`): positive trade outcomes and buy semantics only.
- Red (`#ef4444` / `#ff4444`): negative trade outcomes and sell semantics only.

### Prohibited Color Usage
- No amber, purple, blue, magenta, or additional accent hues.
- No gradients that introduce non-monochrome tint except subtle cyan glow where explicitly allowed.

---

## 2) Design Token Table

### 2.1 Color Tokens

#### Base Monochrome
- `--color-bg-base: #0a0a0a`
- `--color-bg-surface: #111111`
- `--color-bg-elevated: #161616`
- `--color-bg-hover: #1a1a1a`
- `--color-border-subtle: #1e1e1e`
- `--color-border-mid: #2a2a2a`
- `--color-border-strong: #333333`
- `--color-text-primary: #f5f5f5`
- `--color-text-secondary: #bdbdbd`
- `--color-text-tertiary: #7e7e7e`
- `--color-text-label: #555555`
- `--color-text-heading: #444444`

#### System Accent (Cyan Only)
- `--color-system-cyan: #00e5ff`
- `--color-system-cyan-soft: rgba(0, 229, 255, 0.5)`
- `--color-system-cyan-ring: rgba(0, 229, 255, 0.07)`
- `--color-system-cyan-border: rgba(0, 229, 255, 0.3)`
- `--color-system-cyan-bg-soft: rgba(0, 229, 255, 0.02)`

#### Trade Semantics (Only)
- `--color-trade-win: #22c55e`
- `--color-trade-loss: #ef4444`
- `--color-trade-loss-bright: #ff4444`
- `--color-trade-open: rgba(255, 255, 255, 0.6)`
- `--color-trade-be: #333333`

### 2.2 Typography Tokens
- `--font-ui: "DM Sans", system-ui, sans-serif`
- `--font-data: "JetBrains Mono", "Fira Code", "Courier New", monospace`
- `--type-label-size: 11px`
- `--type-label-size-mobile-min: 11px`
- `--type-label-size-mobile-max: 12px`
- `--type-label-tracking: 0.08em`
- `--type-section-size: 11px`
- `--type-section-tracking: 0.10em`
- `--type-body-size: 14px`
- `--type-data-size: 13px`

### 2.3 Radius, Borders, Elevation
- `--radius-card: 10px`
- `--radius-input: 8px`
- `--radius-pill: 999px`
- `--border-card: 1px solid #1e1e1e`
- `--border-card-top-lift: 1px solid #2a2a2a`
- `--border-input: 1px solid #2a2a2a`
- `--ring-input-focus: 0 0 0 3px rgba(0, 229, 255, 0.07)`

### 2.4 Motion Tokens
- `--motion-fast: 150ms ease`
- `--motion-base: 200ms ease`
- `--motion-blink-logo: 530ms step-end infinite`
- `--motion-blink-session: 1.4s step-end infinite`
- `--motion-ai-stagger: 100ms`
- `--motion-card-lift: 120ms ease`

### 2.5 Glow and Shadow Tokens
- `--shadow-fab: 0 0 20px rgba(0,229,255,0.3), 0 4px 12px rgba(0,0,0,0.5)`
- `--shadow-fab-hover: 0 0 32px rgba(0,229,255,0.4), 0 4px 12px rgba(0,0,0,0.5)`
- `--shadow-toast: 0 0 16px rgba(0,229,255,0.08)`
- `--shadow-sell-active: 0 0 16px rgba(255,68,68,0.12)`

---

## 3) Component Acceptance Criteria

### 3.1 Global Canvas and Texture
- Body background uses `#0a0a0a` with repeating horizontal scanline texture alternating `#0a0a0a` and `#0c0c0c` every 2px.
- Texture remains subtle, does not reduce readability.
- Secondary and tertiary text pass readability in daylight-like brightness.

### 3.2 Sidebar Logo
- Text is `EDGE FORGE` in JetBrains Mono, white, `letter-spacing: 0.18em`.
- Cyan blinking cursor `|` appears immediately after logo text.
- Cursor animation uses `530ms step-end infinite`.
- Top spacing uses `12px` padding on desktop sidebar.

### 3.3 Navigation
- Active sidebar item uses cyan state treatment.
- Non-active nav remains monochrome.
- Bottom FAB uses cyan background and black plus icon.
- FAB has specified glow and stronger hover glow.

### 3.4 Panels and Cards
- Panel/card surface uses `#111111`.
- Border is `1px #1e1e1e` plus top lifted edge `1px #2a2a2a`.
- No gradient fills and no multi-color glow.

### 3.5 Inputs
- Input background `#161616`, border `#2a2a2a`.
- Focus border is cyan soft and ring is cyan subtle (`3px` ring token).
- Focus feedback is visible and consistent across input/select/textarea.

### 3.6 BUY / SELL Buttons
- Inactive state: `#181818` background and `#444444` text.
- BUY active: white background, black text, weight 700.
- SELL active: `#1a0000` background, `#ff4444` text, red border and soft red glow.
- Transition uses `all 0.2s ease` and feels weighty.

### 3.7 History Filter Pills
- Inactive pills: `#181818`, border `#333333`, text `#777777`.
- Active pill: white border, white text, `#1a1a1a` background.
- Active Backtest pill only: cyan border and cyan text.

### 3.8 Session Status Pill
- Off-session: dim gray text/border, static dot.
- London open: white border/text and blinking white dot.
- London/NY overlap: cyan border/text and blinking cyan dot.
- Overlap state must be visually stronger than London-only.

### 3.9 Confluence Rows and Checkboxes
- Checked checkbox is white fill with black checkmark.
- Checked row background shifts to `#1a1a1a`.
- Transition includes `background 0.15s ease`.
- No green/red/cyan used in checked checkbox fill.

### 3.10 History Cards and Outcome Stripe
- Left stripe width is `3px`.
- Outcome mapping:
  - Open: `rgba(255,255,255,0.6)`
  - Win: `#22c55e`
  - Loss: `#ef4444`
  - Breakeven: `#333333`
- Hover interaction:
  - border from `#1e1e1e` to `#2e2e2e`
  - slight lift `translateY(-1px)`
  - stripe brightness subtly increases

### 3.11 Toast
- Background `#161616`, cyan-border tint, cyan-soft shadow.
- Text uses JetBrains Mono and white.
- Should feel like a system log event, not a consumer app snackbar.

### 3.12 Screenshot Drop Zone
- Default: dashed white low-opacity border.
- Hover/drag-over: cyan border tint plus cyan-soft background.
- Includes marching-ants style movement effect to indicate input readiness.

### 3.13 Typography Enforcement
- Data surfaces (prices, trade IDs, pnl, lot size, timestamps) must use JetBrains Mono.
- Labels use DM Sans at minimum 11px on mobile.
- Section headers use JetBrains Mono, uppercase, spacing token.
- Body/note text uses DM Sans and readable contrast.

### 3.14 AI Inference “Scan” Moment
- During AI analysis, confluence check outlines animate in top-to-bottom stagger (`100ms`).
- Visual scan color is cyan outline pulse only.
- Completed state leaves checked rows in white checkbox state.
- Error and no-result cases degrade gracefully:
  - No spinner lockups
  - Clear status text
  - Existing manual interaction remains available

---

## 4) Strict “Do Not Use Cyan Here” List
- Do not use cyan on win/loss outcome badges.
- Do not use cyan on PnL gain/loss values.
- Do not use cyan for BUY/SELL semantic text except non-semantic system hints.
- Do not use cyan on confluence checked fill.
- Do not use cyan on generic active chips except explicitly approved Backtest active and system navigation states.
- Do not use cyan as global hover color for all buttons.
- Do not use cyan for static panel/card borders outside system-state highlights.

---

## 5) Contrast and Mobile Readability Requirements
- Mobile labels must never render below 11px.
- Secondary and tertiary text must be readable on panel surfaces in daylight conditions.
- If a text token appears too dim on real devices, increase luminance before shipping.
- Preserve hierarchy by adjusting brightness, not by introducing new colors.

---

## 6) Implementation Sequencing (No Code Here)
1. Introduce all tokens first (color/type/motion/shadow).
2. Refactor components to consume tokens only.
3. Apply cyan governance and trade semantics guards.
4. Implement AI scan animation with fallback states.
5. Run visual QA across desktop and mobile breakpoints.
6. Confirm no unauthorized cyan appears outside approved list.

---

## 7) Definition of Done
- All components comply with this contract.
- No raw hard-coded color values remain in components except token definitions.
- Cyan usage matches approved map exactly.
- Trade semantic colors remain isolated to trade meaning.
- Mobile label typography is 11px minimum.
- Daylight readability checks pass for secondary/tertiary text.
- AI scan interaction is present and gracefully degrades.
