# Theme Service

This app's theming comes from the shared **theme-service** — currently on version `1.2.0`.
The files in this folder are vendored copies of the source of truth; do not hand-edit generated
token files, and do not hardcode colors — consume the theme tokens (`var(--…)`).

## For agents working in this repo
This repo **already uses the theme-service** (see History below). Use the **theme-service skill**
(or its `AGENTS.md`) for any theme work here — don't improvise, and don't re-apply from scratch.
- Update to latest:  "Update this repo to the latest theme-service version."
- Add/change themes:  see the theme-service repo's `CREATING-THEMES.md`.
Rules: keep WCAG AA 2.2 · default theme is Rink Classic · the selector uses the **external**
`theme-init.js` / `theme-select.js` (never inline scripts — MV3/strict CSP blocks them).

## Applied configuration (current decisions on record)
- Component styling: `full-restyle` — popup controls use `components.css` classes (`.switch`, `.input`,
  `.btn-solid`/`.btn-outline`, `.btn-icon`, `.badge`, `.field-label`, `.choice`); app-only pieces
  (logo, per-filter toggle, toast) are styled in `popup.html` with tokens only
- Fonts: `replaced with theme fonts` — `--font-ui` / `--font-mono` (Google Fonts import removed)
- Background effect: `page background` — `.fx-grid` on: `body` (header uses `.fx-bar-top`, footer area `.fx-bar-bottom`)
- Selector: `theme-service selector` (`<select data-theme-select data-dropdown>`, enhanced by `dropdown.js`)
  — placement: bottom THEME bar of the popup, with a Reduce motion checkbox (`data-motion-toggle`)
- Existing themes: `removed` (NEO, RINK; the old `chrome.storage.local.theme` key is cleared on load)
- Brand accent: `--accent-pink` (logo, ON state, + Add, filter toggles); status dot `--accent-green`

## History
<!-- Append one entry per apply/update. Most recent last. Never edit past entries. -->
- `2026-09-23` — Applied theme-service `v1.2.0`. Full restyle of the popup onto components.css with theme fonts, `.fx-grid` on the body, and the NEO/RINK chips replaced by the dropdown theme selector + Reduce motion. Also fixed keyboard access (master switch, per-filter toggle, focus kept after re-render) and replaced the disabled-filter `opacity: .45` (failed AA) with `--text-muted`.
