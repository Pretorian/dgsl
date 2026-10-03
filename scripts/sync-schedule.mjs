#!/usr/bin/env node
/**
 * Sync the committed schedule array against the league's Google Sheet.
 *
 *   node scripts/sync-schedule.mjs --check     # diff only, never writes (CI default)
 *   node scripts/sync-schedule.mjs --write     # rewrite src/constants/index.js
 *   node scripts/sync-schedule.mjs --json      # print normalized games, no diff
 *   node scripts/sync-schedule.mjs --csv=x.csv # parse a hand-downloaded CSV
 *
 * Exit codes:
 *   0  in sync (or --write/--json succeeded)
 *   1  schedule differs from the sheet
 *   2  fetch/IO failure
 *   3  sheet LAYOUT changed — parser assumptions no longer hold, needs a human
 *
 * Code 3 is the interesting one: the parser asserts the sheet's shape before
 * trusting a single cell, so a reordered column or a new age group fails loudly
 * instead of silently producing a plausible-but-wrong schedule.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SHEET_ID = '1MuMp4H9KGzExeirMtpgrWkYm1xLoWEu6gce1WRPo48k';
const GID = '301779930';
const CONSTANTS = 'src/constants/index.js';
const EXPORT_NAME = 'fallScheduleData2026';
const FIELD = 'Upper Fields 1-3';
const RAIN = 'Rain Make Up';

// Column layout of the sheet grid, asserted against the header row below.
const GROUPS = [
  { ageGroup: '6-8', team1: 1, team2: 2, time: 3, header: /ages\s*6\s*-\s*8/i },
  { ageGroup: '9-10', team1: 4, team2: 5, time: 6, header: /ages\s*9\s*-\s*10/i },
  { ageGroup: '11-13', team1: 7, team2: 8, time: 9, header: /ages\s*11\s*-\s*13/i },
];

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

class LayoutError extends Error {}

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

/** Minimal RFC-4180 CSV reader — handles quoted cells, embedded commas and newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i += 1; } else { quoted = false; }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ',') { row.push(cell); cell = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows;
}

const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim();

/** The sheet omits years ("29-Aug"), so take it from the title and roll over mid-season. */
function resolveYear(rows) {
  const title = rows.slice(0, 6).flat().join(' ');
  const match = title.match(/\b(20\d{2})\b/);
  if (!match) {
    throw new LayoutError('No season year found in the first six rows of the sheet.');
  }
  return Number(match[1]);
}

/** Locate the header row and confirm every age-group column sits where we expect. */
function findHeaderRow(rows) {
  const index = rows.findIndex((row) => GROUPS.every((g) => g.header.test(clean(row[g.team1]))));
  if (index === -1) {
    throw new LayoutError(
      'Could not find the age-group header row. Expected one row with "Ages 6 - 8", '
      + '"Ages 9 - 10" and "Ages 11 - 13" in columns 1, 4 and 7.',
    );
  }
  const header = rows[index];
  for (const g of GROUPS) {
    if (!/^time$/i.test(clean(header[g.time]))) {
      throw new LayoutError(
        `Expected a "Time" column at index ${g.time} for ages ${g.ageGroup}, `
        + `found "${clean(header[g.time])}".`,
      );
    }
  }
  // Column 10 holds the location note; an age-group label there means a 4th group appeared.
  if (/ages/i.test(clean(header[10]))) {
    throw new LayoutError(`A fourth age-group column appeared: "${clean(header[10])}".`);
  }
  return index;
}

/**
 * Rain make-up rows have blank time cells, so reuse each group's usual slot times.
 *
 * Uses the most common week's time pattern rather than every distinct time seen, so a
 * one-off reschedule stays a content change instead of masquerading as a layout break.
 */
function slotTimes(games) {
  const byGroup = new Map();
  for (const g of GROUPS) {
    const weeks = new Map();
    for (const game of games) {
      if (game.ageGroup !== g.ageGroup) continue;
      if (!weeks.has(game.date)) weeks.set(game.date, []);
      weeks.get(game.date).push(game.time);
    }
    if (!weeks.size) {
      throw new LayoutError(`No real games found for ages ${g.ageGroup}.`);
    }
    const tally = new Map();
    for (const times of weeks.values()) {
      const key = [...times].sort((a, b) => toMinutes(a) - toMinutes(b)).join(',');
      tally.set(key, (tally.get(key) ?? 0) + 1);
    }
    const modal = [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
    byGroup.set(g.ageGroup, modal.split(','));
  }
  return byGroup;
}

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function parseSchedule(csv) {
  const rows = parseCsv(csv);
  const year = resolveYear(rows);
  const headerIndex = findHeaderRow(rows);

  const real = [];
  const rainRows = [];
  let date = null;
  let rainIndex = new Map();

  for (const raw of rows.slice(headerIndex + 1)) {
    const row = raw.map(clean);
    const stamp = row[0]?.match(/^(\d{1,2})-([A-Za-z]{3})$/);
    if (stamp) {
      const month = MONTHS[stamp[2].toLowerCase()];
      if (!month) throw new LayoutError(`Unrecognised month in date cell "${row[0]}".`);
      // Aug-Dec belong to the season year; Jan-Jul to the next calendar year.
      const y = month >= 8 ? year : year + 1;
      date = `${y}-${String(month).padStart(2, '0')}-${stamp[1].padStart(2, '0')}`;
      rainIndex = new Map();
    }
    if (!date) continue;
    if (row.join(' ').toUpperCase().includes('NO GAMES')) continue;

    for (const g of GROUPS) {
      const team1 = row[g.team1];
      const team2 = row[g.team2];
      if (!team1 || !team2) continue;

      if (team1 === RAIN || team2 === RAIN) {
        const n = rainIndex.get(g.ageGroup) ?? 0;
        rainIndex.set(g.ageGroup, n + 1);
        rainRows.push({ date, ageGroup: g.ageGroup, slot: n });
        continue;
      }

      const time = row[g.time];
      if (!/^\d{1,2}:\d{2}$/.test(time)) {
        throw new LayoutError(
          `Bad time "${time}" for ${date} ages ${g.ageGroup} (${team1} vs ${team2}).`,
        );
      }
      real.push({ date, ageGroup: g.ageGroup, time, team1, team2, field: FIELD });
    }
  }

  if (!real.length) throw new LayoutError('Parsed zero real games — the grid is empty or moved.');

  const times = slotTimes(real);
  const rain = rainRows.map(({ date: d, ageGroup, slot }) => {
    const slots = times.get(ageGroup);
    if (slot >= slots.length) {
      throw new LayoutError(
        `${d} ages ${ageGroup} has more rain make-up rows than the ${slots.length} known slots.`,
      );
    }
    return {
      date: d,
      ageGroup,
      time: slots[slot],
      team1: RAIN,
      team2: RAIN,
      field: FIELD,
      status: RAIN,
    };
  });

  return [...real, ...rain].sort(order);
}

const AGE_ORDER = GROUPS.map((g) => g.ageGroup);
function order(a, b) {
  return a.date.localeCompare(b.date)
    || AGE_ORDER.indexOf(a.ageGroup) - AGE_ORDER.indexOf(b.ageGroup)
    || toMinutes(a.time) - toMinutes(b.time);
}

/** Serialize one game exactly the way the committed array is formatted. */
function render(game) {
  const parts = [
    `"date":${JSON.stringify(game.date)}`,
    `"ageGroup":${JSON.stringify(game.ageGroup)}`,
    `"time":${JSON.stringify(game.time)}`,
    `"team1":${JSON.stringify(game.team1)}`,
    `"team2":${JSON.stringify(game.team2)}`,
    `"field":${JSON.stringify(game.field)}`,
  ];
  if (game.status) parts.push(`"status":${JSON.stringify(game.status)}`);
  return `  {${parts.join(',')}}`;
}

function locateBlock(source) {
  const start = source.indexOf(`export const ${EXPORT_NAME} = [`);
  if (start === -1) throw new LayoutError(`${CONSTANTS} has no "export const ${EXPORT_NAME} = [".`);
  const open = source.indexOf('[', start);
  const close = source.indexOf('\n];', open);
  if (close === -1) throw new LayoutError(`Could not find the end of ${EXPORT_NAME}.`);
  return { open, close };
}

function readCommitted(source) {
  const { open, close } = locateBlock(source);
  const body = source.slice(open + 1, close);
  return body
    .split('\n')
    .map((line) => line.trim().replace(/,$/, ''))
    .filter((line) => line.startsWith('{'))
    .map((line) => JSON.parse(line));
}

const keyOf = (g) => `${g.date} ${g.ageGroup} ${g.time}`;
const summarise = (g) => `${g.team1} vs ${g.team2}${g.status ? ` [${g.status}]` : ''}`;

function diff(committed, sheet) {
  const a = new Map(committed.map((g) => [keyOf(g), g]));
  const b = new Map(sheet.map((g) => [keyOf(g), g]));
  const changes = [];
  for (const key of [...new Set([...a.keys(), ...b.keys()])].sort()) {
    const was = a.get(key);
    const now = b.get(key);
    if (!was) changes.push({ kind: 'added', key, now });
    else if (!now) changes.push({ kind: 'removed', key, was });
    else if (summarise(was) !== summarise(now)) changes.push({ kind: 'changed', key, was, now });
  }
  return changes;
}

async function loadCsv() {
  const local = opt('csv');
  if (local) {
    try {
      return await readFile(path.resolve(local), 'utf8');
    } catch (cause) {
      const err = new Error(`Could not read ${local}: ${cause.message}`);
      err.exit = 2;
      throw err;
    }
  }

  const url = opt('url')
    || `https://docs.google.com/spreadsheets/d/${opt('id', SHEET_ID)}/export`
      + `?format=csv&gid=${opt('gid', GID)}`;

  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    const err = new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);
    err.exit = 2;
    throw err;
  }
  const text = await res.text();
  if (/<html/i.test(text.slice(0, 200))) {
    const err = new Error(
      'Sheet returned HTML, not CSV — it is probably no longer publicly viewable.',
    );
    err.exit = 2;
    throw err;
  }
  return text;
}

async function main() {
  const csv = await loadCsv();
  const sheet = parseSchedule(csv);

  if (flag('json')) {
    process.stdout.write(`${JSON.stringify(sheet, null, 2)}\n`);
    return 0;
  }

  const file = path.resolve(CONSTANTS);
  const source = await readFile(file, 'utf8');
  const committed = readCommitted(source);
  const changes = diff(committed, sheet);

  console.log(`sheet: ${sheet.length} games   committed: ${committed.length} games`);

  if (!changes.length) {
    console.log('✓ in sync — no changes');
    return 0;
  }

  console.log(`\n${changes.length} change${changes.length === 1 ? '' : 's'}:\n`);
  for (const c of changes) {
    if (c.kind === 'added') console.log(`  + ${c.key}  ${summarise(c.now)}`);
    else if (c.kind === 'removed') console.log(`  - ${c.key}  ${summarise(c.was)}`);
    else console.log(`  ~ ${c.key}  ${summarise(c.was)}  ->  ${summarise(c.now)}`);
  }

  if (!flag('write')) {
    console.log(`\nRun with --write to apply these to ${CONSTANTS}.`);
    return 1;
  }

  const { open, close } = locateBlock(source);
  const body = `\n${sheet.map(render).join(',\n')}`;
  await writeFile(file, source.slice(0, open + 1) + body + source.slice(close), 'utf8');
  console.log(`\n✓ wrote ${sheet.length} games to ${CONSTANTS}`);
  return 0;
}

try {
  process.exitCode = await main();
} catch (err) {
  if (err instanceof LayoutError) {
    console.error('\n✗ SHEET LAYOUT CHANGED — not safe to sync automatically\n');
    console.error(`  ${err.message}\n`);
    console.error('  The parser refuses to guess. Open the sheet, compare it against the');
    console.error('  column layout in scripts/sync-schedule.mjs, and update the parser.\n');
    process.exitCode = 3;
  } else {
    console.error(`\n✗ ${err.message}\n`);
    process.exitCode = Number.isInteger(err.exit) ? err.exit : 2;
  }
}
