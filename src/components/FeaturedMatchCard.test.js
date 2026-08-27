import React from 'react';
import { render, screen } from '@testing-library/react';
import FeaturedMatchCard from './FeaturedMatchCard';

describe('FeaturedMatchCard', () => {
  const mockMatch = {
    date: '2026-03-14',
    time: '9:00',
    ageGroup: '6-8',
    team1: 'Argentina',
    team2: 'Brazil',
    field: 'Upper Fields 1-3'
  };

  const mockGetGameStatus = jest.fn(() => 'Scheduled');

  it('should render match information', () => {
    render(<FeaturedMatchCard match={mockMatch} getGameStatus={mockGetGameStatus} />);

    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('vs')).toBeInTheDocument();
    expect(screen.getByText('9:00')).toBeInTheDocument();
    expect(screen.getByText('6-8')).toBeInTheDocument();
    expect(screen.getByText('Upper Fields 1-3')).toBeInTheDocument();
  });

  it('should display formatted date', () => {
    render(<FeaturedMatchCard match={mockMatch} getGameStatus={mockGetGameStatus} />);
    expect(screen.getByText('Mar 14')).toBeInTheDocument();
  });

  it('should call getGameStatus with match', () => {
    render(<FeaturedMatchCard match={mockMatch} getGameStatus={mockGetGameStatus} />);
    expect(mockGetGameStatus).toHaveBeenCalledWith(mockMatch);
  });

  it('should display game status', () => {
    const getStatus = jest.fn(() => 'Played');
    render(<FeaturedMatchCard match={mockMatch} getGameStatus={getStatus} />);
    expect(screen.getByText('Played')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    const { container } = render(<FeaturedMatchCard match={mockMatch} getGameStatus={mockGetGameStatus} />);
    const article = container.querySelector('article');

    expect(article).toHaveAttribute('aria-label');
    expect(article.getAttribute('aria-label')).toContain('Argentina');
    expect(article.getAttribute('aria-label')).toContain('Brazil');
  });

  it('should render age group badge with correct class', () => {
    const { container } = render(<FeaturedMatchCard match={mockMatch} getGameStatus={mockGetGameStatus} />);
    const badge = container.querySelector('.match-age-badge-blue');
    expect(badge).toBeInTheDocument();
  });

  it('should render different age group colors', () => {
    const match910 = { ...mockMatch, ageGroup: '9-10' };
    const { container } = render(<FeaturedMatchCard match={match910} getGameStatus={mockGetGameStatus} />);
    const badge = container.querySelector('.match-age-badge-green');
    expect(badge).toBeInTheDocument();
  });

  it('should render status badge with correct class for Played', () => {
    const getStatus = jest.fn(() => 'Played');
    const { container } = render(<FeaturedMatchCard match={mockMatch} getGameStatus={getStatus} />);
    const badge = container.querySelector('.match-status-played');
    expect(badge).toBeInTheDocument();
  });

  it('should render status badge with correct class for Cancelled', () => {
    const getStatus = jest.fn(() => 'Cancelled');
    const { container } = render(<FeaturedMatchCard match={mockMatch} getGameStatus={getStatus} />);
    const badge = container.querySelector('.match-status-cancelled');
    expect(badge).toBeInTheDocument();
  });
});
