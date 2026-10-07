import { countryCodeMap, fieldLocation } from '../constants';

// Helper function to get flag URL
export const getFlagUrl = (teamName) => {
  const code = countryCodeMap[teamName];
  if (!code) return null;
  // Using flagcdn.com for high-quality flag images
  // Format: https://flagcdn.com/w40/{country-code}.png
  return `https://flagcdn.com/w40/${code}.png`;
};

// Helper function to get age group color
export const getAgeGroupColor = (ageGroup) => {
  switch(ageGroup) {
    case '6-8':
      return '#3B82F6'; // Blue
    case '9-10':
      return '#10B981'; // Green
    case '11-13':
      return '#F59E0B'; // Orange
    default:
      return '#6B7280'; // Gray
  }
};

// Helper function to format date
export const formatDate = (dateStr) => {
  // Parse date as local time to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
};

// Helper function to generate unique game ID
export const getGameId = (match) => {
  return `${match.date}-${match.time}-${match.ageGroup}`;
};

// Helper function to get weather emoji
export const getWeatherEmoji = (condition) => {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return '☀️';
  if (conditionLower.includes('cloud')) return '☁️';
  if (conditionLower.includes('rain')) return '🌧️';
  if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return '⛈️';
  if (conditionLower.includes('snow')) return '❄️';
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
  return '🌤️';
};

// Helper function to get age group badge class
export const getAgeGroupBadgeClass = (ageGroup) => {
  switch(ageGroup) {
    case '6-8': return 'match-age-badge match-age-badge-blue';
    case '9-10': return 'match-age-badge match-age-badge-green';
    case '11-13': return 'match-age-badge match-age-badge-orange';
    default: return 'match-age-badge';
  }
};

// Helper function to get status class
export const getStatusClass = (status) => {
  switch(status) {
    case 'Played': return 'match-status-badge match-status-played';
    case 'Cancelled': return 'match-status-badge match-status-cancelled';
    case 'Rain Make Up': return 'match-status-badge match-status-rain';
    default: return 'match-status-badge match-status-scheduled';
  }
};

// Escape text per RFC 5545 (backslash, semicolon, comma, newline)
const escapeIcsText = (text) =>
  String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

// Helper function to build an iCalendar (.ics) event for a match.
// Times are local to the park, so they're pinned to America/New_York.
export const buildCalendarEvent = (match, durationMinutes = 60, now = new Date()) => {
  const [year, month, day] = match.date.split('-').map(Number);
  const [hours, minutes] = match.time.split(':').map(Number);
  const end = new Date(Date.UTC(year, month - 1, day, hours, minutes + durationMinutes));

  const pad = (n) => String(n).padStart(2, '0');
  const localStamp = (y, mo, d, h, mi) => `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(mi)}00`;
  const dtStart = localStamp(year, month, day, hours, minutes);
  const dtEnd = localStamp(end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes());
  const dtStamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const location = `${match.field}, ${fieldLocation.name}, ${fieldLocation.address}`;
  const description = `DGSL ${match.ageGroup} game: ${match.team1} vs ${match.team2}\nField: ${match.field}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DGSL//Game Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:America/New_York',
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0400',
    'TZNAME:EDT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0500',
    'TZNAME:EST',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${getGameId(match)}@dgsl`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=America/New_York:${dtStart}`,
    `DTEND;TZID=America/New_York:${dtEnd}`,
    `SUMMARY:${escapeIcsText(`DGSL: ${match.team1} vs ${match.team2} (${match.ageGroup})`)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Game reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
};

// Helper function to download a match as an .ics file (opens in Apple Calendar)
export const downloadCalendarEvent = (match) => {
  const blob = new Blob([buildCalendarEvent(match)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dgsl-${getGameId(match)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
