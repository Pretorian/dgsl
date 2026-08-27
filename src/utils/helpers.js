import { countryCodeMap } from '../constants';

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
