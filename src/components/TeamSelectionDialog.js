import React from 'react';
import { getFlagUrl } from '../utils/helpers';

/**
 * TeamSelectionDialog component - Modal dialog for selecting favorite team
 */
const TeamSelectionDialog = ({ isOpen, onClose, currentFavorite, onSelectTeam, allTeams }) => {
  const [selectedTeam, setSelectedTeam] = React.useState(currentFavorite);

  React.useEffect(() => {
    setSelectedTeam(currentFavorite);
  }, [currentFavorite]);

  // Handle Escape key to close dialog
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSave = () => {
    onSelectTeam(selectedTeam);
    onClose();
  };

  const handleClear = () => {
    setSelectedTeam(null);
    onSelectTeam(null);
    onClose();
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="dialog-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-dialog-title"
    >
      <div
        className="dialog-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2 id="team-dialog-title" className="dialog-title">
            <span aria-hidden="true">⚽</span>
            Choose Your Favorite Team
          </h2>
          <button
            className="dialog-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="dialog-body">
          <p className="dialog-subtitle">
            Select your favorite team to see their upcoming matches first in the featured carousel
            <br />
            <small>(Shows all games from today through the next 7 days)</small>
          </p>

          <div className="team-grid">
            {allTeams
              .filter(team => team !== 'Rain Make Up')
              .map((team) => {
                const flagUrl = getFlagUrl(team);
                return (
                  <div
                    key={team}
                    className={`team-card ${selectedTeam === team ? 'selected' : ''}`}
                    onClick={() => setSelectedTeam(team)}
                    onKeyDown={(e) => handleKeyDown(e, () => setSelectedTeam(team))}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedTeam === team}
                  >
                    {flagUrl && (
                      <img
                        src={flagUrl}
                        alt={`${team} flag`}
                        className="team-card-flag"
                      />
                    )}
                    <div className="team-card-name">{team}</div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="dialog-actions">
          <button
            className="dialog-btn dialog-btn-secondary"
            onClick={handleClear}
          >
            Clear Favorite
          </button>
          <button
            className="dialog-btn dialog-btn-primary"
            onClick={handleSave}
          >
            Save Favorite
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSelectionDialog;
