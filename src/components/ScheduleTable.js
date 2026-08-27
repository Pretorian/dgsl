import React from 'react';
import TeamFlag from './TeamFlag';
import { formatDate, getAgeGroupColor } from '../utils/helpers';

/**
 * ScheduleTable component - Main table displaying all matches
 */
const ScheduleTable = ({
  filteredMatches,
  getGameStatus,
  updateGameStatus,
  sortConfig,
  handleSort,
  getSortIndicator
}) => {
  return (
    <main id="main-content" className="table-section">
      <div className="table-wrapper">
        <table className="schedule-table" aria-label="Game schedule table">
          <thead>
            <tr className="table-header-row">
              <th
                className="table-header table-header-sortable"
                onClick={() => handleSort('date')}
                onKeyPress={(e) => e.key === 'Enter' && handleSort('date')}
                tabIndex={0}
                aria-sort={sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                DATE{getSortIndicator('date')}
              </th>
              <th
                className="table-header table-header-sortable"
                onClick={() => handleSort('time')}
                onKeyPress={(e) => e.key === 'Enter' && handleSort('time')}
                tabIndex={0}
                aria-sort={sortConfig.key === 'time' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                TIME{getSortIndicator('time')}
              </th>
              <th className="table-header">AGE GROUP</th>
              <th className="table-header">FIELD</th>
              <th
                className="table-header table-header-sortable"
                onClick={() => handleSort('team1')}
                onKeyPress={(e) => e.key === 'Enter' && handleSort('team1')}
                tabIndex={0}
                aria-sort={sortConfig.key === 'team1' ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                HOME TEAM{getSortIndicator('team1')}
              </th>
              <th className="table-header-center"><span className="visually-hidden">Versus</span></th>
              <th className="table-header">AWAY TEAM</th>
              <th className="table-header">LOCATION</th>
              <th className="table-header">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.length > 0 ? (
              filteredMatches.map((match, idx) => {
                const currentStatus = getGameStatus(match);
                let rowClass = 'table-row';
                if (currentStatus === 'Played') {
                  rowClass += ' table-row-played';
                } else if (currentStatus === 'Cancelled') {
                  rowClass += ' table-row-cancelled';
                } else if (currentStatus === 'Rain Make Up') {
                  rowClass += ' table-row-rain';
                } else {
                  rowClass += idx % 2 === 0 ? ' table-row-even' : ' table-row-odd';
                }

                return (
                  <tr key={idx} className={rowClass}>
                    <td className="table-cell">{formatDate(match.date)}</td>
                    <td className="table-cell table-cell-time">{match.time}</td>
                    <td className="table-cell">
                      <span className="age-group-cell">
                        <span
                          className="age-group-badge"
                          style={{ backgroundColor: getAgeGroupColor(match.ageGroup) }}
                          aria-hidden="true"
                        ></span>
                        <span className="age-group-text">{match.ageGroup}</span>
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="field-badge">
                        {match.field}
                      </span>
                    </td>
                    <td className="table-cell table-cell-team">
                      <TeamFlag teamName={match.team1} />
                    </td>
                    <td className="table-cell table-cell-center" aria-hidden="true">vs</td>
                    <td className="table-cell table-cell-team">
                      <TeamFlag teamName={match.team2} />
                    </td>
                    <td className="table-cell table-cell-location">Merrick-Moore</td>
                    <td className="table-cell">
                      <select
                        value={currentStatus}
                        onChange={(e) => updateGameStatus(match, e.target.value)}
                        className="status-select"
                        aria-label={`Change status for ${match.team1} versus ${match.team2} match`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Played">Played</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rain Make Up">Rain Make Up</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="no-results">
                  No matches found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default ScheduleTable;
