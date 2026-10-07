import React from 'react';
import TeamFlag from './TeamFlag';
import { getAgeGroupBadgeClass, getStatusClass, downloadCalendarEvent } from '../utils/helpers';

/**
 * FeaturedMatchCard component - Displays a single match card in the featured carousel
 */
const FeaturedMatchCard = ({ match, getGameStatus, favoriteTeam }) => {
  const currentStatus = getGameStatus(match);
  const isFavoriteMatch = Boolean(favoriteTeam) && (match.team1 === favoriteTeam || match.team2 === favoriteTeam);
  const canAddToCalendar = isFavoriteMatch && currentStatus !== 'Cancelled' && currentStatus !== 'Played';

  return (
    <article
      className="featured-match-card"
      tabIndex="0"
      aria-label={`Match: ${match.team1} versus ${match.team2} on ${new Date(match.date + 'T00:00:00').toLocaleDateString()} at ${match.time}`}
    >
      {/* Date & Time Header */}
      <div className="match-header">
        <div className="match-date-time">
          <span className="match-date">
            {new Date(match.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span className="match-time">
            {match.time}
          </span>
        </div>
        <span className={getAgeGroupBadgeClass(match.ageGroup)}>
          {match.ageGroup}
        </span>
      </div>

      {/* Teams */}
      <div className="match-teams">
        {/* Team 1 */}
        <div className="match-team">
          <TeamFlag teamName={match.team1} />
        </div>

        {/* VS */}
        <div className="match-vs" aria-hidden="true">
          vs
        </div>

        {/* Team 2 */}
        <div className="match-team">
          <TeamFlag teamName={match.team2} />
        </div>
      </div>

      {/* Field & Status */}
      <div className="match-footer">
        <span className="match-field">
          <span aria-hidden="true">📍</span>
          {match.field}
        </span>
        <span className={getStatusClass(currentStatus)}>
          {currentStatus}
        </span>
      </div>

      {canAddToCalendar && (
        <button
          type="button"
          className="add-to-calendar-btn"
          onClick={() => downloadCalendarEvent(match)}
          aria-label={`Add ${match.team1} versus ${match.team2} to calendar`}
        >
          <span aria-hidden="true">📅</span> Add to Calendar
        </button>
      )}
    </article>
  );
};

export default FeaturedMatchCard;
