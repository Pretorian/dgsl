# Changelog

Notable changes to the DGSL schedule app. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project uses
[semantic versioning](https://semver.org/).

## [1.1.0] — 2026-10-02

Added tooling to keep the committed schedule in step with the league's Google
Sheet. Previously the sheet was the source of truth and the app's copy was
retyped by hand, with nothing to catch a mid-season reschedule.

### Added

- **`scripts/sync-schedule.mjs`** — fetches the league's Google Sheet as CSV,
  normalizes it, and diffs it against `fallScheduleData2026`. No dependencies;
  uses a built-in CSV reader and `fetch`.
  - `--check` reports differences without writing (CI default)
  - `--write` regenerates the array in `src/constants/index.js`
  - `--json` prints the parsed sheet
  - `--csv=<file>`, `--gid=<id>`, `--url=<url>`, `--id=<sheet>` for other sources
  - Exit codes: `0` in sync, `1` differs, `2` fetch failure, `3` layout changed
- **Layout assertions.** The parser validates the sheet's shape — age-group
  column positions, a `Time` column per group, a season year in the title, the
  absence of a fourth age group — before trusting any cell. A reordered column
  or new age group exits `3` and refuses to sync, rather than emitting a
  plausible-but-wrong schedule. This is the case that needs a human; the routine
  polling does not.
- **npm scripts**: `schedule:check`, `schedule:sync`, `schedule:dump`.
- **`.github/workflows/sync-schedule.yml`** — runs the check on a cron (Friday
  23:00 UTC, Saturday and Sunday 11:00 UTC, timed around the league's weather
  cancellation updates) and opens a pull request when the sheet differs,
  reusing the day's existing PR if one is open. Also runnable by hand from the
  Actions tab with a `pull-request` / `report-only` choice and an optional sheet
  URL override. Uploads the diff as a job artifact. Fails the job on exit `2` or
  `3` instead of opening a PR.
- **`CHANGELOG.md`** — this file.

### Changed

- `README.md` rewritten. It described Spring 2026 as the current season and told
  readers to edit a `scheduleDataJson` array in `src/App.js`, which has not
  existed since the data moved to `src/constants/index.js`. Now documents the
  season switcher, the real export names, the sync workflow, and the exit codes.
- `CLAUDE.md` updated for the two-season layout (`fallScheduleData2026`,
  `springScheduleData2026`, the `seasons` registry and the `dgsl-season` key),
  the sync tooling, and the pre-existing `useLocalStorage` test failure.
- `package.json` version `1.0.0` → `1.1.0`.

### Notes

- Running `schedule:sync` today is a no-op: the committed Fall 2026 data already
  matches the sheet on all 96 real games, and the generator reproduces all 120
  committed lines byte-for-byte, so the first real sync will be a minimal diff
  rather than a whole-file reformat.
- Rain make-up rows have blank time cells in the sheet but times in the app. The
  script infers them from each age group's most common weekly time pattern, so a
  one-off reschedule registers as a content change rather than a layout break.
- **Known, not fixed:** `src/hooks/useLocalStorage.test.js` fails all 11 of its
  tests (`TypeError: localStorage.getItem.mockClear is not a function`). The
  `beforeEach` expects jest mock functions from `src/setupTests.js`, which
  installs plain functions instead. This predates 1.1.0 — a clean tree runs 131
  passing / 11 failing — and no app behaviour is affected.
- No automated test covers the sync script itself; it is verified by running
  `schedule:check` against the live sheet and by feeding `--csv=` fixtures with
  mutated layouts to confirm each exit code.

## Earlier

Releases before 1.1.0 predate this changelog. Reconstructed from git history:

- **2026-08-25** — Fall 2026 schedule added alongside Spring 2026 as an archived
  season; GitHub Actions bumped to Node 24-native action versions.
- **2026-05-12** — Deployment moved to GitHub Actions; schedule corrections.
- **2026-04-20** — WCAG accessibility pass (skip-to-main link, `aria-sort` on
  sortable headers, `aria-live` regions, `role="dialog"`/`aria-modal` on the team
  dialog, keyboard handlers alongside every `onClick`); QuickStart docs.
- **2026-03-30** — GitHub Pages deployment, security headers, age group column.
- **2026-03-25** — v1.0.1.
- **2026-03-21** — v1.0.0, initial release.
