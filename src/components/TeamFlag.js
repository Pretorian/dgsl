import React from 'react';
import { getFlagUrl } from '../utils/helpers';

/**
 * TeamFlag component - Shows flag + team name, with soft fail to team name only
 */
const TeamFlag = ({ teamName }) => {
  const [showFlag, setShowFlag] = React.useState(true);
  const flagUrl = getFlagUrl(teamName);

  // Always render the team name, optionally with flag
  return (
    <span className="team-flag-container">
      {flagUrl && showFlag && (
        <img
          src={flagUrl}
          alt=""
          role="presentation"
          className="team-flag-img"
          onError={() => setShowFlag(false)}
        />
      )}
      <span>{teamName}</span>
    </span>
  );
};

export default TeamFlag;
