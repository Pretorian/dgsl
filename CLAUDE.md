# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page React app (Create React App) that displays and filters the Durham Girls Soccer League (DGSL) game schedule. No backend — each season's schedule is a static array embedded in source, and per-session UI state persists via `localStorage`.

Two seasons ship in the app: **Fall 2026 (current)** and **Spring 2026 (archived)**. A season `<select>` in the header switches between them; the choice persists in `dgsl-season`.

The upstream source of truth is a league-maintained Google Sheet, which `scripts/sync-schedule.mjs` diffs against the committed data (see **Syncing the schedule** below).

## Commands

```bash
npm start                 # dev server at http://localhost:3000
npm test                  # jest/react-testing-library, watch mode
npm test -- --watchAll=false            # single run (e.g. for CI-style checks)
npm test -- ScheduleTable               # run tests matching a filename/pattern
npm run build              # production build — outputs to docs/, NOT build/

npm run schedule:check     # diff committed schedule against the league Google Sheet
npm run schedule:sync      # apply the sheet's changes to src/constants/index.js
npm run schedule:dump      # print the parsed sheet as JSON
```

There is no separate lint command; ESLint runs via `react-scripts` (config `eslintConfig.extends: react-app` in package.json) and reports during `start`/`build`/`test`.

## Deployment

- `npm run build` sets `BUILD_PATH='./docs'` so the production bundle lands in `docs/`, not the CRA default `build/` (`.gitignore` excludes `build/` but explicitly keeps `docs/`).
- `.github/workflows/deploy.yml` builds and deploys `docs/` to GitHub Pages automatically on every push to `master`.
- `.github/workflows/sync-schedule.yml` checks the league Google Sheet on a cron (Fri 23:00, Sat/Sun 11:00 UTC) and can be run by hand from the Actions tab. It opens a PR when the sheet differs; it does **not** deploy.
- The `master` branch is the source branch (app code + docs/ output); `gh-pages` is a separate branch. Confirm which branch you're on (`git branch`) before assuming where changes should land — GitHub Pages deployment here is driven by the Actions workflow on `master`, not by pushing to `gh-pages` directly.
- `homepage` in package.json is `https://Pretorian.github.io/dgsl-2026`.

## Architecture

**State lives in `App.js`, not in components.** `App.js` is the single owner of all filter/sort/status state and data derivations (unique dates, unique teams, filtered+sorted matches, weather fetch). Components under `src/components/` are presentational — they receive state and callbacks as props and don't manage schedule state themselves. When adding a new filter or piece of persisted state, wire it up in `App.js` first.

**Persistence pattern:** every piece of user-facing UI state (selected season, selected filters, sort config, favorite team, per-game status overrides, filters-expanded toggle) is stored via `useLocalStorage` (`src/hooks/useLocalStorage.js`), keyed with a `dgsl-` prefix (e.g. `dgsl-age-group`, `dgsl-sort-config`). The hook takes an `isJSON` flag for values that need `JSON.stringify`/`parse` (objects/arrays like `sortConfig` and `gameStatuses`); plain strings don't set it. Follow this convention for any new persisted UI state.

**Game status overrides:** the season arrays in `src/constants/index.js` have a static, mostly-immutable `status` field (e.g. `"Rain Make Up"`, `"Cancelled"`). Users can override a game's displayed status (Scheduled/Played/Cancelled/Rain Make Up) from the table UI; overrides are stored separately in the `gameStatuses` localStorage map, keyed by `getGameId(match)` (`${date}-${time}-${ageGroup}`, from `src/utils/helpers.js`) — not written back into the season arrays. Always resolve a game's current status through `getGameStatus(match)` in `App.js`, never by reading `match.status` directly, since a user override should win.

**Season data:** `src/constants/index.js` exports one array per season — `fallScheduleData2026` (current) and `springScheduleData2026` (archived) — plus a `seasons` array that wires them to the UI switcher:

```js
export const seasons = [
  { id: 'fall-2026', name: 'Fall 2026', archived: false, data: fallScheduleData2026 },
  { id: 'spring-2026', name: 'Spring 2026', archived: true, data: springScheduleData2026 },
];
```

`App.js` reads `seasons`, resolves the selected one, and derives everything from `currentSeason.data`. To add a season, add its array plus a `seasons` entry — nothing else needs touching. Game shape: date `YYYY-MM-DD`, `ageGroup` one of `6-8`/`9-10`/`11-13`, `time` as `H:MM`/`HH:MM`, `team1`/`team2`, `field`, optional `status`. There's no data-loading layer.

**Syncing the schedule:** prefer `npm run schedule:check` / `npm run schedule:sync` over hand-editing — `scripts/sync-schedule.mjs` pulls the league's Google Sheet as CSV and diffs it against `fallScheduleData2026`. It regenerates the array in the exact committed one-object-per-line format, so a sync produces a minimal diff rather than a reformat.

Hand-edit only for things the sheet doesn't carry (e.g. a status the league announced by phone). If you change the array's formatting, re-check `render()` in the script, which reproduces it byte-for-byte.

The script exits `0` in sync, `1` differs, `2` can't fetch, `3` **sheet layout changed**. Exit `3` means the parser's column assumptions no longer hold — it deliberately refuses to guess rather than emit a plausible-but-wrong schedule. That's the case that needs a human: open the sheet, compare it to the `GROUPS` column map at the top of the script, and update the parser.

Useful flags when the sheet moves or goes private: `--csv=<file>` (parse a hand-downloaded CSV), `--gid=<id>` (a different tab), `--url=<url>` (anywhere else).

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

**Known failure:** `src/hooks/useLocalStorage.test.js` fails all 11 of its tests with `TypeError: localStorage.getItem.mockClear is not a function` — its `beforeEach` expects `setupTests.js` to install jest mock functions, but the global mock assigns plain functions. This predates the schedule-sync work; a full `npm test` run is 131 passing / 11 failing on a clean tree. Don't read it as a regression you caused, and fix it separately if you touch that hook.

`scripts/sync-schedule.mjs` has no unit test — it's exercised by running `npm run schedule:check` against the live sheet, and by feeding `--csv=` fixtures with mutated layouts to confirm the exit codes.
