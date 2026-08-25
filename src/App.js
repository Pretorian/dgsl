import React, { useState, useMemo, useEffect, useRef } from 'react';

// Components
import WeatherWidget from './components/WeatherWidget';
import FeaturedMatches from './components/FeaturedMatches';
import TeamSelectionDialog from './components/TeamSelectionDialog';
import FilterSection from './components/FilterSection';
import ScheduleTable from './components/ScheduleTable';

// Utils and Constants
import { seasons } from './constants';
import { formatDate, getGameId } from './utils/helpers';
import { useLocalStorage } from './hooks/useLocalStorage';

const App = () => {
  // Season selection (which schedule to display)
  const [selectedSeasonId, setSelectedSeasonId] = useLocalStorage('dgsl-season', seasons[0].id);
  const currentSeason = seasons.find(season => season.id === selectedSeasonId) || seasons[0];
  const scheduleData = currentSeason.data;

  // Filter state with localStorage persistence
  const [selectedAgeGroup, setSelectedAgeGroup] = useLocalStorage('dgsl-age-group', 'all');
  const [selectedField, setSelectedField] = useLocalStorage('dgsl-field', 'all');
  const [selectedTeam, setSelectedTeam] = useLocalStorage('dgsl-team', 'all');
  const [selectedDate, setSelectedDate] = useLocalStorage('dgsl-date', 'all');
  const [showGames, setShowGames] = useLocalStorage('dgsl-show-games', 'all');
  const [sortConfig, setSortConfig] = useLocalStorage('dgsl-sort-config', { key: null, direction: 'asc' }, true);
  const [filtersExpanded, setFiltersExpanded] = useLocalStorage('dgsl-filters-expanded', 'true');
  const [favoriteTeam, setFavoriteTeam] = useLocalStorage('dgsl-favorite-team', null);
  const [gameStatuses, setGameStatuses] = useLocalStorage('dgsl-game-statuses', {}, true);

  // UI state (not persisted)
  const [weather, setWeather] = useState(null);
  const [showTeamDialog, setShowTeamDialog] = useState(false);

  // Convert string boolean back to boolean for filtersExpanded
  useEffect(() => {
    if (typeof filtersExpanded === 'string') {
      setFiltersExpanded(filtersExpanded === 'true');
    } else if (filtersExpanded === null && window.innerWidth <= 768) {
      setFiltersExpanded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch weather data for Durham, NC
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Using wttr.in API for simple weather data (no API key needed)
        const response = await fetch('https://wttr.in/Durham,NC?format=j1');
        const data = await response.json();

        if (data && data.current_condition && data.current_condition[0]) {
          const current = data.current_condition[0];
          setWeather({
            temp: current.temp_F,
            condition: current.weatherDesc[0].value,
            icon: current.weatherCode,
            feelsLike: current.FeelsLikeF,
            humidity: current.humidity,
            windSpeed: current.windspeedMiles
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Get the current status of a game
  const getGameStatus = (match) => {
    const gameId = getGameId(match);
    return gameStatuses[gameId] || match.status || 'Scheduled';
  };

  // Update game status
  const updateGameStatus = (match, newStatus) => {
    const gameId = getGameId(match);
    setGameStatuses(prev => ({
      ...prev,
      [gameId]: newStatus
    }));
  };

  // Get unique dates from schedule
  const uniqueDates = useMemo(() => {
    const dates = [...new Set(scheduleData.map(match => match.date))];
    return dates.sort();
  }, [scheduleData]);

  // Get all teams from schedule
  const allTeams = useMemo(() => {
    const teams = new Set();
    scheduleData.forEach(match => {
      teams.add(match.team1);
      teams.add(match.team2);
    });
    return Array.from(teams).sort();
  }, [scheduleData]);

  // Reset team/date filters when switching seasons, since they're tied to a specific season's data
  const isFirstSeasonRender = useRef(true);
  useEffect(() => {
    if (isFirstSeasonRender.current) {
      isFirstSeasonRender.current = false;
      return;
    }
    setSelectedTeam('all');
    setSelectedDate('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeasonId]);

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let matches = scheduleData.filter(match => {
      const currentStatus = getGameStatus(match);
      const ageGroupMatch = selectedAgeGroup === 'all' || match.ageGroup === selectedAgeGroup;
      const fieldMatch = selectedField === 'all' || match.field === selectedField;
      const dateMatch = selectedDate === 'all' || match.date === selectedDate;
      const teamMatch = selectedTeam === 'all' ||
        match.team1 === selectedTeam || match.team2 === selectedTeam;
      const gameMatch = showGames === 'all' ||
        (showGames === 'rain' && currentStatus === 'Rain Make Up') ||
        (showGames === 'scheduled' && currentStatus === 'Scheduled') ||
        (showGames === 'played' && currentStatus === 'Played') ||
        (showGames === 'cancelled' && currentStatus === 'Cancelled');

      return ageGroupMatch && fieldMatch && dateMatch && teamMatch && gameMatch;
    });

    // Apply sorting
    if (sortConfig.key) {
      matches.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'date') {
          aValue = new Date(a.date);
          bValue = new Date(b.date);
        } else if (sortConfig.key === 'time') {
          const timeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
          };
          aValue = timeToMinutes(a.time);
          bValue = timeToMinutes(b.time);
        } else if (sortConfig.key === 'team1') {
          aValue = a.team1.toLowerCase();
          bValue = b.team1.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return matches;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleData, selectedAgeGroup, selectedField, selectedDate, selectedTeam, showGames, sortConfig, gameStatuses]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return ' ↕';
    }
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="app-container">
      <a href="#main-content" className="skip-to-main">Skip to main content</a>

      <header id="site-header" className="site-header">
        <h1 className="site-title">
          <span className="site-title-icon" aria-hidden="true">⚽</span> DGSL {currentSeason.name} Game Schedule
          {currentSeason.archived && <span className="season-archived-badge">Archived</span>}
        </h1>
        <div className="season-select-wrapper">
          <label htmlFor="season-select" className="season-select-label">Season</label>
          <select
            id="season-select"
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            className="season-select"
            aria-label="Select season"
          >
            {seasons.map(season => (
              <option key={season.id} value={season.id}>
                {season.name}{season.archived ? ' (Archived)' : ''}
              </option>
            ))}
          </select>
        </div>
      </header>

      <FeaturedMatches
        matches={scheduleData}
        getGameStatus={getGameStatus}
        favoriteTeam={favoriteTeam}
        onOpenTeamDialog={() => setShowTeamDialog(true)}
      />

      <div className="age-banner" role="region" aria-label="Current filter status">
        <h2 className="age-banner-text">
          <span aria-hidden="true">🏆</span>
          {selectedAgeGroup === 'all' ? 'All Age Groups (6-13)' : `Ages ${selectedAgeGroup}`}
          {' • '}
          {filteredMatches.length} {filteredMatches.length === 1 ? 'Game' : 'Games'}
          {selectedTeam !== 'all' && ` • Team: ${selectedTeam}`}
          {selectedDate !== 'all' && ` • Date: ${formatDate(selectedDate)}`}
          {showGames !== 'all' && ` • ${showGames.charAt(0).toUpperCase() + showGames.slice(1)}`}
          {weather && (
            <>
              <span aria-hidden="true">•</span>
              <WeatherWidget weather={weather} />
            </>
          )}
        </h2>
      </div>

      <div className="info-notice" role="note" aria-label="Game status and age group legend">
        <p className="info-notice-text">
          <span aria-hidden="true">ℹ️</span>
          <span>Game Status Colors: Green = Played | Red = Cancelled | Yellow = Rain Make Up</span>
          <span aria-hidden="true">•</span>
          <span>Age Groups:</span>
          <span className="age-group-indicator">
            <span className="age-group-dot age-group-dot-blue" aria-hidden="true"></span>
            6-8
          </span>
          <span aria-hidden="true">|</span>
          <span className="age-group-indicator">
            <span className="age-group-dot age-group-dot-green" aria-hidden="true"></span>
            9-10
          </span>
          <span aria-hidden="true">|</span>
          <span className="age-group-indicator">
            <span className="age-group-dot age-group-dot-orange" aria-hidden="true"></span>
            11-13
          </span>
        </p>
      </div>

      <FilterSection
        filtersExpanded={filtersExpanded}
        setFiltersExpanded={setFiltersExpanded}
        selectedAgeGroup={selectedAgeGroup}
        setSelectedAgeGroup={setSelectedAgeGroup}
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        showGames={showGames}
        setShowGames={setShowGames}
        uniqueDates={uniqueDates}
        allTeams={allTeams}
      />

      <ScheduleTable
        filteredMatches={filteredMatches}
        getGameStatus={getGameStatus}
        updateGameStatus={updateGameStatus}
        sortConfig={sortConfig}
        handleSort={handleSort}
        getSortIndicator={getSortIndicator}
      />

      <footer id="site-footer" className="site-footer">
        <div className="footer-content">
          <p className="footer-info">Field Location: Merrick Moore Park (632 N. Hoover Road, Durham NC 27703)</p>
          <p className="footer-info-small">DPR Values: Inclusivity, Fun, Stewardship, Leadership through Service, and Safety</p>
          <p className="footer-info-tiny">Weather Cancellation Line: 919-560-4636 Press #4 for Soccer announcements</p>
          <p className="footer-info-tiny">Weather cancellation line will be updated by 4:30pm on weekdays and by 7:30am on weekends</p>
          <p className="footer-info-tiny">League Coordinator: Robert Edoukou 919-560-4355 or at Robert.Edoukou@durhamnc.gov</p>
        </div>
      </footer>

      <TeamSelectionDialog
        isOpen={showTeamDialog}
        onClose={() => setShowTeamDialog(false)}
        currentFavorite={favoriteTeam}
        onSelectTeam={setFavoriteTeam}
        allTeams={allTeams}
      />
    </div>
  );
};

export default App;
