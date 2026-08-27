import {
  getFlagUrl,
  getAgeGroupColor,
  formatDate,
  getGameId,
  getWeatherEmoji,
  getAgeGroupBadgeClass,
  getStatusClass
} from './helpers';

describe('helpers', () => {
  describe('getFlagUrl', () => {
    it('should return correct flag URL for valid team', () => {
      expect(getFlagUrl('Argentina')).toBe('https://flagcdn.com/w40/ar.png');
      expect(getFlagUrl('Brazil')).toBe('https://flagcdn.com/w40/br.png');
      expect(getFlagUrl('Madagascar')).toBe('https://flagcdn.com/w40/mg.png');
    });

    it('should return null for invalid team', () => {
      expect(getFlagUrl('InvalidTeam')).toBeNull();
      expect(getFlagUrl('')).toBeNull();
    });

    it('should handle special country codes', () => {
      expect(getFlagUrl('Scotland')).toBe('https://flagcdn.com/w40/gb-sct.png');
      expect(getFlagUrl('France/Egypt')).toBe('https://flagcdn.com/w40/fr.png');
    });
  });

  describe('getAgeGroupColor', () => {
    it('should return correct color for each age group', () => {
      expect(getAgeGroupColor('6-8')).toBe('#3B82F6');
      expect(getAgeGroupColor('9-10')).toBe('#10B981');
      expect(getAgeGroupColor('11-13')).toBe('#F59E0B');
    });

    it('should return default color for unknown age group', () => {
      expect(getAgeGroupColor('unknown')).toBe('#6B7280');
      expect(getAgeGroupColor('')).toBe('#6B7280');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      expect(formatDate('2026-03-14')).toBe('3/14');
      expect(formatDate('2026-12-25')).toBe('12/25');
      expect(formatDate('2026-01-01')).toBe('1/1');
    });
  });

  describe('getGameId', () => {
    it('should generate unique game ID', () => {
      const match = {
        date: '2026-03-14',
        time: '9:00',
        ageGroup: '6-8'
      };
      expect(getGameId(match)).toBe('2026-03-14-9:00-6-8');
    });

    it('should generate different IDs for different matches', () => {
      const match1 = { date: '2026-03-14', time: '9:00', ageGroup: '6-8' };
      const match2 = { date: '2026-03-14', time: '10:00', ageGroup: '6-8' };
      expect(getGameId(match1)).not.toBe(getGameId(match2));
    });
  });

  describe('getWeatherEmoji', () => {
    it('should return correct emoji for weather conditions', () => {
      expect(getWeatherEmoji('Clear')).toBe('☀️');
      expect(getWeatherEmoji('Sunny')).toBe('☀️');
      expect(getWeatherEmoji('Cloudy')).toBe('☁️');
      expect(getWeatherEmoji('Rain')).toBe('🌧️');
      expect(getWeatherEmoji('Rainy')).toBe('🌧️');
      expect(getWeatherEmoji('Storm')).toBe('⛈️');
      expect(getWeatherEmoji('Thunder')).toBe('⛈️');
      expect(getWeatherEmoji('Snow')).toBe('❄️');
      expect(getWeatherEmoji('Fog')).toBe('🌫️');
      expect(getWeatherEmoji('Mist')).toBe('🌫️');
    });

    it('should return default emoji for unknown condition', () => {
      expect(getWeatherEmoji('Unknown')).toBe('🌤️');
      expect(getWeatherEmoji('')).toBe('🌤️');
    });

    it('should be case insensitive', () => {
      expect(getWeatherEmoji('CLEAR')).toBe('☀️');
      expect(getWeatherEmoji('clear')).toBe('☀️');
      expect(getWeatherEmoji('Clear')).toBe('☀️');
    });
  });

  describe('getAgeGroupBadgeClass', () => {
    it('should return correct class for each age group', () => {
      expect(getAgeGroupBadgeClass('6-8')).toBe('match-age-badge match-age-badge-blue');
      expect(getAgeGroupBadgeClass('9-10')).toBe('match-age-badge match-age-badge-green');
      expect(getAgeGroupBadgeClass('11-13')).toBe('match-age-badge match-age-badge-orange');
    });

    it('should return default class for unknown age group', () => {
      expect(getAgeGroupBadgeClass('unknown')).toBe('match-age-badge');
    });
  });

  describe('getStatusClass', () => {
    it('should return correct class for each status', () => {
      expect(getStatusClass('Played')).toBe('match-status-badge match-status-played');
      expect(getStatusClass('Cancelled')).toBe('match-status-badge match-status-cancelled');
      expect(getStatusClass('Rain Make Up')).toBe('match-status-badge match-status-rain');
      expect(getStatusClass('Scheduled')).toBe('match-status-badge match-status-scheduled');
    });

    it('should return default class for unknown status', () => {
      expect(getStatusClass('unknown')).toBe('match-status-badge match-status-scheduled');
    });
  });
});
