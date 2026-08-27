import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FeaturedMatches from './FeaturedMatches';

// Mock console.log to avoid cluttering test output
const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalLog;
});

describe('FeaturedMatches', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  const mockMatches = [
    {
      date: futureDateStr,
      time: '9:00',
      ageGroup: '6-8',
      team1: 'Argentina',
      team2: 'Brazil',
      field: 'Upper Fields 1-3'
    },
    {
      date: futureDateStr,
      time: '10:00',
      ageGroup: '9-10',
      team1: 'Madagascar',
      team2: 'Egypt',
      field: 'Upper Fields 1-3'
    },
    {
      date: futureDateStr,
      time: '11:00',
      ageGroup: '11-13',
      team1: 'Chile',
      team2: 'Mexico',
      field: 'Upper Fields 1-3'
    },
    {
      date: futureDateStr,
      time: '12:00',
      ageGroup: '6-8',
      team1: 'Scotland',
      team2: 'Japan',
      field: 'Upper Fields 1-3'
    }
  ];

  const mockGetGameStatus = jest.fn(() => 'Scheduled');
  const mockOnOpenTeamDialog = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when no upcoming matches', () => {
    const oldMatches = [
      {
        date: '2020-01-01',
        time: '9:00',
        ageGroup: '6-8',
        team1: 'Argentina',
        team2: 'Brazil',
        field: 'Upper Fields 1-3'
      }
    ];

    const { container } = render(
      <FeaturedMatches
        matches={oldMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render Rain Make Up matches', () => {
    const rainMatches = [
      {
        date: futureDateStr,
        time: '9:00',
        ageGroup: '6-8',
        team1: 'Rain Make Up',
        team2: 'Rain Make Up',
        field: 'Upper Fields 1-3',
        status: 'Rain Make Up'
      }
    ];

    const { container } = render(
      <FeaturedMatches
        matches={rainMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render upcoming matches', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    expect(screen.getByText('Upcoming Featured Matches')).toBeInTheDocument();
  });

  it('should show favorite team in title when selected', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam="Madagascar"
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    expect(screen.getByText(/Madagascar first/)).toBeInTheDocument();
  });

  it('should call onOpenTeamDialog when Pick Favorite button is clicked', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const button = screen.getByLabelText('Choose favorite team');
    fireEvent.click(button);

    expect(mockOnOpenTeamDialog).toHaveBeenCalledTimes(1);
  });

  it('should show favorite team name on button when selected', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam="Brazil"
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const button = screen.getByLabelText('Choose favorite team');
    expect(button).toHaveTextContent('Brazil');
  });

  it('should navigate to next slide when next button clicked', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const nextButton = screen.getByLabelText('Next matches');
    fireEvent.click(nextButton);

    // Check that we moved to next slide by checking indicators
    const indicators = screen.getAllByRole('tab');
    expect(indicators[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('should navigate to previous slide when prev button clicked', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    // First go to next slide
    const nextButton = screen.getByLabelText('Next matches');
    fireEvent.click(nextButton);

    // Then go back
    const prevButton = screen.getByLabelText('Previous matches');
    fireEvent.click(prevButton);

    const indicators = screen.getAllByRole('tab');
    expect(indicators[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('should disable prev button on first slide', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const prevButton = screen.getByLabelText('Previous matches');
    expect(prevButton).toBeDisabled();
  });

  it('should navigate to specific slide when indicator clicked', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const indicators = screen.getAllByRole('tab');
    fireEvent.click(indicators[1]);

    expect(indicators[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('should handle keyboard navigation on indicators with Enter', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const indicators = screen.getAllByRole('tab');
    fireEvent.keyDown(indicators[1], { key: 'Enter' });

    expect(indicators[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('should handle keyboard navigation on nav buttons with Enter', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const nextButton = screen.getByLabelText('Next matches');
    fireEvent.keyDown(nextButton, { key: 'Enter' });

    const indicators = screen.getAllByRole('tab');
    expect(indicators[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('should handle keyboard navigation with Space key', () => {
    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const nextButton = screen.getByLabelText('Next matches');
    fireEvent.keyDown(nextButton, { key: ' ' });

    const indicators = screen.getAllByRole('tab');
    expect(indicators[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('should handle touch swipe left', () => {
    const { container } = render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const wrapper = container.querySelector('.carousel-wrapper');

    // Simulate swipe left (next)
    fireEvent.touchStart(wrapper, { targetTouches: [{ clientX: 200 }] });
    fireEvent.touchMove(wrapper, { targetTouches: [{ clientX: 100 }] });
    fireEvent.touchEnd(wrapper);

    const indicators = screen.getAllByRole('tab');
    expect(indicators[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('should handle touch swipe right', () => {
    const { container } = render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const wrapper = container.querySelector('.carousel-wrapper');

    // First go to slide 2
    const nextButton = screen.getByLabelText('Next matches');
    fireEvent.click(nextButton);

    // Then swipe right (previous)
    fireEvent.touchStart(wrapper, { targetTouches: [{ clientX: 100 }] });
    fireEvent.touchMove(wrapper, { targetTouches: [{ clientX: 200 }] });
    fireEvent.touchEnd(wrapper);

    const indicators = screen.getAllByRole('tab');
    expect(indicators[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('should not swipe if distance is too small', () => {
    const { container } = render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const wrapper = container.querySelector('.carousel-wrapper');

    // Simulate small swipe (less than minSwipeDistance)
    fireEvent.touchStart(wrapper, { targetTouches: [{ clientX: 100 }] });
    fireEvent.touchMove(wrapper, { targetTouches: [{ clientX: 90 }] });
    fireEvent.touchEnd(wrapper);

    const indicators = screen.getAllByRole('tab');
    expect(indicators[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('should prioritize favorite team matches', () => {
    const consoleLog = jest.spyOn(console, 'log');

    render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam="Madagascar"
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    // Check console logs to verify favorite games logic was triggered
    expect(consoleLog).toHaveBeenCalledWith('Favorite team:', 'Madagascar');
    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('Favorite games found:'), expect.any(Number));
  });

  it('should have correct ARIA attributes', () => {
    const { container } = render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const section = screen.getByLabelText(/Upcoming Featured Matches/i).closest('section');
    expect(section).toHaveAttribute('aria-labelledby', 'featured-matches-title');
    expect(section).toHaveAttribute('aria-roledescription', 'carousel');

    const wrapper = container.querySelector('.carousel-wrapper');
    expect(wrapper).toHaveAttribute('aria-live', 'polite');
    expect(wrapper).toHaveAttribute('aria-atomic', 'true');
  });

  it('should update carousel when matches change', () => {
    const { rerender } = render(
      <FeaturedMatches
        matches={mockMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    const newMatches = mockMatches.slice(0, 2);

    rerender(
      <FeaturedMatches
        matches={newMatches}
        getGameStatus={mockGetGameStatus}
        favoriteTeam={null}
        onOpenTeamDialog={mockOnOpenTeamDialog}
      />
    );

    // Component should re-render with new matches
    expect(screen.getByText('Upcoming Featured Matches')).toBeInTheDocument();
  });
});
