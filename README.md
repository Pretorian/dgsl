# DGSL Spring Game Schedule 2026 - Filter App

A React-based web application for viewing and filtering the Durham Girls Soccer League (DGSL) Spring 2026 game schedule.

## Features

- **Filter by Age Group**: 6-8, 9-10, or 11-13
- **Filter by Team**: Select any team to see their matches
- **Filter by Date**: View games on specific dates
- **Filter by Game Type**: All games, scheduled games, or rain make-ups
- **Sortable Columns**: Click on Date, Time, or Home Team headers to sort (ascending/descending)
- **Visual Indicators**: Rain Make Up games highlighted in yellow
- **Responsive Design**: Works on desktop, tablet, and mobile devices


## Schedule Information

- **Season**: Spring 2026
- **Dates**: March 14 - June 6, 2026
- **Location**: Merrick Moore Park (632 N. Hoover Road, Durham NC 27703)
- **Weather Line**: 919-560-4636 Press #4
- **Coordinator**: Robert Edoukou (919-560-4355, Robert.Edoukou@durhamnc.gov)

### Special Dates

- **April 11**: No games (Merrick Moore unavailable)
- **May 16, May 30, June 6**: Rain Make Up dates

## Updating the Schedule

To update the schedule data, edit the `scheduleDataJson` array in `src/App.js`. Follow the existing data structure format.

## Troubleshooting

**Port already in use**
If port 3000 is already in use, you can:
- Stop the other application using port 3000
- Or start on a different port: `PORT=3001 npm start`

