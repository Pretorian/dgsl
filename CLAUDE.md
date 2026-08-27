# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page React app (Create React App) that displays and filters the Durham Girls Soccer League (DGSL) Spring 2026 game schedule. No backend — all schedule data is a static array embedded in source, and per-session UI state persists via `localStorage`.

## Commands

```bash
npm start                 # dev server at http://localhost:3000
npm test                  # jest/react-testing-library, watch mode
npm test -- --watchAll=false            # single run (e.g. for CI-style checks)
npm test -- ScheduleTable               # run tests matching a filename/pattern
npm run build              # production build — outputs to docs/, NOT build/
```

There is no separate lint command; ESLint runs via `react-scripts` (config `eslintConfig.extends: react-app` in package.json) and reports during `start`/`build`/`test`.

## Deployment

- `npm run build` sets `BUILD_PATH='./docs'` so the production bundle lands in `docs/`, not the CRA default `build/` (`.gitignore` excludes `build/` but explicitly keeps `docs/`).
- `.github/workflows/deploy.yml` builds and deploys `docs/` to GitHub Pages automatically on every push to `master`.
- The `master` branch is the source branch (app code + docs/ output); `gh-pages` is a separate branch. Confirm which branch you're on (`git branch`) before assuming where changes should land — GitHub Pages deployment here is driven by the Actions workflow on `master`, not by pushing to `gh-pages` directly.
- `homepage` in package.json is `https://Pretorian.github.io/dgsl-2026`.

## Architecture

**State lives in `App.js`, not in components.** `App.js` is the single owner of all filter/sort/status state and data derivations (unique dates, unique teams, filtered+sorted matches, weather fetch). Components under `src/components/` are presentational — they receive state and callbacks as props and don't manage schedule state themselves. When adding a new filter or piece of persisted state, wire it up in `App.js` first.

**Persistence pattern:** every piece of user-facing UI state (selected filters, sort config, favorite team, per-game status overrides, filters-expanded toggle) is stored via `useLocalStorage` (`src/hooks/useLocalStorage.js`), keyed with a `dgsl-` prefix (e.g. `dgsl-age-group`, `dgsl-sort-config`). The hook takes an `isJSON` flag for values that need `JSON.stringify`/`parse` (objects/arrays like `sortConfig` and `gameStatuses`); plain strings don't set it. Follow this convention for any new persisted UI state.

**Game status overrides:** the schedule data (`src/constants/index.js`) has a static, mostly-immutable `status` field (e.g. `"Rain Make Up"`, `"Cancelled"`). Users can override a game's displayed status (Scheduled/Played/Cancelled/Rain Make Up) from the table UI; overrides are stored separately in the `gameStatuses` localStorage map, keyed by `getGameId(match)` (`${date}-${time}-${ageGroup}`, from `src/utils/helpers.js`) — not written back into `scheduleData`. Always resolve a game's current status through `getGameStatus(match)` in `App.js`, never by reading `match.status` directly, since a user override should win.

**Updating the schedule:** edit the `scheduleData` array literal in `src/constants/index.js` directly (date `YYYY-MM-DD`, `ageGroup` one of `6-8`/`9-10`/`11-13`, `time` as `H:MM`/`HH:MM`, `team1`/`team2`, `field`, optional `status`). There's no data-loading layer to update.

**Team flags:** `TeamFlag.js` renders a flag image for a team name by looking it up in `countryCodeMap` (`src/constants/index.js`) and building a flagcdn.com URL via `getFlagUrl`. Team names in `scheduleData` are actually country names (this is a World-Cup-themed team naming scheme) — any new team added to the schedule needs a matching entry in `countryCodeMap` or it silently renders without a flag.

**Component responsibilities:**
- `FeaturedMatches` / `FeaturedMatchCard` — carousel of upcoming matches (next 7 days), with favorite-team-first ordering, touch swipe, and responsive card count (1 mobile / 3 desktop).
- `TeamSelectionDialog` — modal for picking/clearing the favorite team, saved to `dgsl-favorite-team`.
- `FilterSection` — collapsible filter controls (age group, field, team, date, game type).
- `ScheduleTable` — sortable full results table; per-row status `<select>` calls back into `App.js`'s `updateGameStatus`.
- `WeatherWidget` — renders live weather fetched in `App.js` from `wttr.in` (no API key) every 30 minutes.

**Styling:** plain CSS in `src/index.css` (~1200 lines, BEM-ish class names like `table-header-sortable`, `match-status-badge`) plus a small `src/uefa.css`. No CSS modules / styled-components / Tailwind.

**Accessibility conventions** are load-bearing throughout the app (this was explicitly WCAG-audited — see recent commit history): skip-to-main link, `aria-sort` on sortable headers, `aria-live` regions, `role="dialog"`/`aria-modal` on the team dialog, keyboard handlers (`Enter`/`Space`) alongside every `onClick` on interactive non-button elements. Preserve these patterns when touching existing components or adding new interactive elements.

## Testing

Every component/util/hook has a co-located `*.test.js`. `src/setupTests.js` mocks `window.localStorage` globally and resets mocks in `beforeEach`. `App.test.js` mocks `global.fetch` for the weather call. When adding features touching persisted state or the weather widget, follow these existing mocking patterns rather than hitting real `localStorage`/network in tests.
