# DGSL Game Schedule

A React web app for viewing and filtering the Durham Girls Soccer League (DGSL) game schedule.

Live: **https://Pretorian.github.io/dgsl-2026**

## Features

- **Season switcher**: Fall 2026 (current) and Spring 2026 (archived)
- **Featured matches**: carousel of the next 7 days, favourite team first
- **Favourite team**: pick one and it sorts to the front; saved between visits
- **Filter** by age group (6-8, 9-10, 11-13), team, date, field, or game type
- **Sortable columns**: click Date, Time, or Home Team to sort
- **Per-game status**: mark a game Scheduled / Played / Cancelled / Rain Make Up
- **Live weather** for the field, refreshed every 30 minutes
- **Team flags**: teams are named after countries, rendered with their flags
- **Accessible**: keyboard navigation, `aria-live` regions, `aria-sort` headers, skip-to-main
- **Responsive**: desktop, tablet, and mobile

Filters, sort order, favourite team, and status overrides all persist in `localStorage`.

## Schedule Information

- **Current season**: Fall 2026 — August 29 to November 7, 2026
- **Location**: Merrick Moore Park (632 N. Hoover Road, Durham NC 27703)
- **Weather line**: 919-560-4636, press #4 for soccer announcements
  - Updated by 4:30pm on weekdays, 7:30am on weekends
- **Coordinator**: Robert Edoukou (919-560-4355, Robert.Edoukou@durhamnc.gov)

### Special Dates

- **September 5**: No games (Labor Day weekend)
- **October 31, November 7**: Rain make-up dates

## Getting Started

```bash
npm install
npm start        # http://localhost:3000
npm test         # watch mode
npm run build    # production build -> docs/
```

See [QuickStart.md](QuickStart.md) for a longer walkthrough.

## Updating the Schedule

The league maintains the authoritative schedule in a Google Sheet. Rather than
retyping it, diff the committed data against that sheet:

```bash
npm run schedule:check    # show what differs; changes nothing
npm run schedule:sync     # apply the sheet's changes to src/constants/index.js
```

`schedule:check` prints a per-game diff, not an array dump:

```
2 changes:
  - 2026-10-17 6-8 9:00  Argentina vs Costa Rica
  + 2026-10-17 6-8 9:30  Argentina vs Mexico
```

This also runs automatically — see [Automated syncing](#automated-syncing).

### Other sources

```bash
# A tab other than the default
node scripts/sync-schedule.mjs --gid=123456789

# A CSV you downloaded by hand (also the fallback if the sheet goes private)
node scripts/sync-schedule.mjs --csv=~/Downloads/dgsl.csv --write

# Any other URL
node scripts/sync-schedule.mjs --url='https://example.com/schedule.csv'
```

### Exit codes

| Code | Meaning |
| --- | --- |
| `0` | In sync |
| `1` | Schedule differs from the sheet |
| `2` | Could not fetch the sheet (network, or no longer public) |
| `3` | **Sheet layout changed** — the parser needs updating by hand |

Code `3` is the important one. The script checks the sheet's shape — column
positions, the three age-group blocks, a season year in the title — before
trusting any cell. If the league reorders columns or adds an age group, it stops
instead of producing a schedule that looks right but isn't. Open the sheet,
compare it to the `GROUPS` map at the top of `scripts/sync-schedule.mjs`, and
update the parser.

### By hand

Season data lives in `src/constants/index.js` as one array per season
(`fallScheduleData2026`, `springScheduleData2026`), registered in the `seasons`
array. Each game looks like:

```js
{"date":"2026-08-29","ageGroup":"6-8","time":"9:00","team1":"Scotland","team2":"Japan","field":"Upper Fields 1-3"}
```

`date` is `YYYY-MM-DD`, `ageGroup` is one of `6-8`/`9-10`/`11-13`, `time` is
`H:MM` or `HH:MM`, and `status` is optional. A new team also needs an entry in
`countryCodeMap` in the same file, or it renders without a flag.

## Automated syncing

`.github/workflows/sync-schedule.yml` checks the sheet on a schedule and opens a
pull request when it differs, so a mid-season reschedule doesn't go unnoticed.

- **Cron**: Friday 23:00 UTC, Saturday and Sunday 11:00 UTC — after the league's
  weekend cancellation update, before the 9:00 kickoff.
- **Manual**: Actions → *Sync schedule from Google Sheet* → **Run workflow**.
  Choose `pull-request` (default) or `report-only`, and optionally override the
  sheet URL.

If the sheet's layout changes, the job fails loudly rather than opening a PR.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds and
publishes `docs/` to GitHub Pages. `npm run build` writes to `docs/` rather than
CRA's default `build/`.

## Troubleshooting

**Port already in use** — stop the other process, or `PORT=3001 npm start`.

**`schedule:check` reports exit 2** — the sheet is probably no longer publicly
viewable. Download it as CSV and use `--csv=`.

**`useLocalStorage` tests fail** — known pre-existing breakage (11 tests,
`localStorage.getItem.mockClear is not a function`); the global mock in
`src/setupTests.js` doesn't install jest mock functions. Unrelated to app
behaviour.
