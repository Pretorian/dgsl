import React from 'react';
import FeaturedMatchCard from './FeaturedMatchCard';

/**
 * FeaturedMatches component - Carousel with swipe support showing upcoming matches
 */
const FeaturedMatches = ({ matches, getGameStatus, favoriteTeam, onOpenTeamDialog }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [carouselMatches, setCarouselMatches] = React.useState([]);
  const [isMobile, setIsMobile] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Detect screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize carousel with upcoming games, prioritizing favorite team
  React.useEffect(() => {
    const now = new Date();

    // Get today's date at start of day (midnight)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get 7 days from today
    const sevenDaysFromToday = new Date(today);
    sevenDaysFromToday.setDate(today.getDate() + 7);

    // Get all upcoming games in the next 7 days (not Rain Make Up)
    // Include all games from today onwards, regardless of time
    const allUpcomingGames = matches
      .filter(m => {
        if (m.status === 'Rain Make Up') return false;
        const matchDateOnly = new Date(m.date + 'T00:00:00');
        // Include today through 6 days from now (7 days total)
        return matchDateOnly >= today && matchDateOnly < sevenDaysFromToday;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateA - dateB;
      });

    console.log(`Searching for games from ${today.toLocaleDateString()} to ${sevenDaysFromToday.toLocaleDateString()}`);
    console.log('Total upcoming games found:', allUpcomingGames.length);

    if (favoriteTeam) {
      // Separate favorite team games from other games
      const favoriteGames = allUpcomingGames.filter(
        m => m.team1 === favoriteTeam || m.team2 === favoriteTeam
      );
      const otherGames = allUpcomingGames.filter(
        m => m.team1 !== favoriteTeam && m.team2 !== favoriteTeam
      );

      console.log('Favorite team:', favoriteTeam);
      console.log('Favorite games found:', favoriteGames.length);
      console.log('Favorite games:', favoriteGames.map(g => `${g.date} ${g.time} - ${g.team1} vs ${g.team2}`));
      console.log('Other games found:', otherGames.length);

      // Show favorite team's games first, then other games
      setCarouselMatches([...favoriteGames, ...otherGames]);
    } else {
      // No favorite team - just show all upcoming games
      setCarouselMatches(allUpcomingGames);
    }
  }, [matches, favoriteTeam]);

  if (carouselMatches.length === 0) {
    return null;
  }

  // Calculate cards per slide based on screen size
  const cardsPerSlide = isMobile ? 1 : 3;
  const totalSlides = Math.ceil(carouselMatches.length / cardsPerSlide);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalSlides - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && canGoNext) {
      handleNext();
    }
    if (isRightSwipe && canGoPrev) {
      handlePrev();
    }
  };

  // Get current games to display
  const startIdx = currentIndex * cardsPerSlide;
  const currentGames = carouselMatches.slice(startIdx, startIdx + cardsPerSlide);

  return (
    <section
      id="featured-matches"
      className="featured-matches-section"
      aria-labelledby="featured-matches-title"
      aria-roledescription="carousel"
    >
      <div className="featured-matches-container">
        <h2 id="featured-matches-title" className="featured-matches-title">
          <div className="featured-matches-title-text">
            <span aria-hidden="true">⭐</span> Upcoming Featured Matches
            {favoriteTeam && (
              <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#6b7280', marginLeft: '0.5rem' }}>
                ({favoriteTeam} first)
              </span>
            )}
          </div>
          <button
            className="favorite-team-btn"
            onClick={onOpenTeamDialog}
            aria-label="Choose favorite team"
          >
            <span aria-hidden="true">❤️</span>
            {favoriteTeam || 'Pick Favorite'}
          </button>
        </h2>

        <div className="carousel-container">
          {/* Previous Button */}
          <button
            className="carousel-nav-btn carousel-nav-btn-prev"
            onClick={handlePrev}
            disabled={!canGoPrev}
            aria-label="Previous matches"
            onKeyDown={(e) => handleKeyDown(e, handlePrev)}
          >
            ‹
          </button>

          {/* Carousel Content with Touch Support */}
          <div
            className="carousel-wrapper"
            aria-live="polite"
            aria-atomic="true"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="featured-matches-grid" style={{ gridTemplateColumns: `repeat(${cardsPerSlide}, 1fr)` }}>
              {currentGames.map((match, idx) => (
                <FeaturedMatchCard key={startIdx + idx} match={match} getGameStatus={getGameStatus} />
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            className="carousel-nav-btn carousel-nav-btn-next"
            onClick={handleNext}
            disabled={!canGoNext}
            aria-label="Next matches"
            onKeyDown={(e) => handleKeyDown(e, handleNext)}
          >
            ›
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="carousel-indicators" role="tablist" aria-label="Carousel slides">
          {[...Array(totalSlides)].map((_, idx) => (
            <button
              key={idx}
              className={`carousel-indicator ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(idx)}
              onKeyDown={(e) => handleKeyDown(e, () => goToSlide(idx))}
              aria-label={`Go to slide ${idx + 1} of ${totalSlides}`}
              aria-selected={idx === currentIndex}
              role="tab"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMatches;
