import React from 'react';
import { formatDate } from '../utils/helpers';

/**
 * FilterSection component - Collapsible filters for the schedule
 */
const FilterSection = ({
  filtersExpanded,
  setFiltersExpanded,
  selectedAgeGroup,
  setSelectedAgeGroup,
  selectedField,
  setSelectedField,
  selectedTeam,
  setSelectedTeam,
  selectedDate,
  setSelectedDate,
  showGames,
  setShowGames,
  uniqueDates,
  allTeams
}) => {
  return (
    <section id="filters" className="filters-section" aria-label="Schedule filters">
      <div
        className="filters-header"
        onClick={() => setFiltersExpanded(!filtersExpanded)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setFiltersExpanded(!filtersExpanded);
          }
        }}
        aria-expanded={filtersExpanded}
        aria-controls="filters-content"
      >
        <h3 className="filters-title">
          <span aria-hidden="true">🔍</span>
          Filters
        </h3>
        <button
          className={`filters-toggle-btn ${!filtersExpanded ? 'collapsed' : ''}`}
          aria-label={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
          onClick={(e) => {
            e.stopPropagation();
            setFiltersExpanded(!filtersExpanded);
          }}
        >
          ▼
        </button>
      </div>

      <div
        id="filters-content"
        className={`filters-content ${!filtersExpanded ? 'collapsed' : ''}`}
        aria-hidden={!filtersExpanded}
      >
        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="age-group-filter" className="filter-label">AGE GROUP</label>
            <select
              id="age-group-filter"
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="filter-select"
              aria-label="Filter by age group"
              tabIndex={filtersExpanded ? 0 : -1}
            >
              <option value="all">All Ages</option>
              <option value="6-8">Ages 6-8</option>
              <option value="9-10">Ages 9-10</option>
              <option value="11-13">Ages 11-13</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="field-filter" className="filter-label">FILTER BY FIELD</label>
            <select
              id="field-filter"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="filter-select"
              aria-label="Filter by field location"
              tabIndex={filtersExpanded ? 0 : -1}
            >
              <option value="all">All Fields</option>
              <option value="Upper Fields 1-3">Upper Fields 1-3</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="team-filter" className="filter-label">FILTER BY TEAM</label>
            <select
              id="team-filter"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="filter-select"
              aria-label="Filter by team"
              tabIndex={filtersExpanded ? 0 : -1}
            >
              <option value="all">All Teams</option>
              {allTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date-filter" className="filter-label">FILTER BY DATE</label>
            <select
              id="date-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="filter-select"
              aria-label="Filter by date"
              tabIndex={filtersExpanded ? 0 : -1}
            >
              <option value="all">All Dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>{formatDate(date)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter" className="filter-label">SHOW GAMES</label>
            <select
              id="status-filter"
              value={showGames}
              onChange={(e) => setShowGames(e.target.value)}
              className="filter-select"
              aria-label="Filter by game status"
              tabIndex={filtersExpanded ? 0 : -1}
            >
              <option value="all">All Games</option>
              <option value="scheduled">Scheduled</option>
              <option value="played">Played</option>
              <option value="cancelled">Cancelled</option>
              <option value="rain">Rain Make Ups</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterSection;
