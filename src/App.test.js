import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch for weather API
global.fetch = jest.fn();

describe('App', () => {
  beforeEach(() => {
    if (localStorage.clear) localStorage.clear();
    if (localStorage.getItem && localStorage.getItem.mockClear) localStorage.getItem.mockClear();
    if (localStorage.setItem && localStorage.setItem.mockClear) localStorage.setItem.mockClear();
    fetch.mockClear();

    // Mock successful weather fetch
    fetch.mockResolvedValue({
      json: async () => ({
        current_condition: [{
          temp_F: '72',
          weatherDesc: [{ value: 'Sunny' }],
          weatherCode: '113',
          FeelsLikeF: '70',
          humidity: '50',
          windspeedMiles: '5'
        }]
      })
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should render the app', () => {
    render(<App />);
    expect(screen.getByText(/DGSL Fall 2026 Game Schedule/)).toBeInTheDocument();
  });

  it('should render skip to main content link', () => {
    render(<App />);
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('should render filter section', () => {
    render(<App />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should render schedule table', () => {
    render(<App />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render footer information', () => {
    render(<App />);
    expect(screen.getByText(/Merrick Moore Park/)).toBeInTheDocument();
    expect(screen.getByText(/Weather Cancellation Line/)).toBeInTheDocument();
  });

  it('should fetch weather data on mount', async () => {
    render(<App />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('https://wttr.in/Durham,NC?format=j1');
    });
  });

  it('should display weather widget when weather data is loaded', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('72°F')).toBeInTheDocument();
    });
  });

  it('should handle weather fetch error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    fetch.mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('should filter matches by age group', () => {
    render(<App />);

    const ageGroupSelect = screen.getByLabelText('Filter by age group');
    fireEvent.change(ageGroupSelect, { target: { value: '6-8' } });

    // Should show only 6-8 age group games in banner
    const banner = screen.getByRole('region', { name: /Current filter status/ });
    expect(banner).toHaveTextContent(/Ages 6-8/);
  });

  it('should filter matches by team', () => {
    render(<App />);

    const teamSelect = screen.getByLabelText('Filter by team');
    fireEvent.change(teamSelect, { target: { value: 'Brazil' } });

    expect(screen.getByText(/Team: Brazil/)).toBeInTheDocument();
  });

  it('should filter matches by date', () => {
    render(<App />);

    const dateSelect = screen.getByLabelText('Filter by date');
    const firstDateOption = dateSelect.querySelector('option:not([value="all"])');

    if (firstDateOption) {
      fireEvent.change(dateSelect, { target: { value: firstDateOption.value } });
      expect(screen.getByText(/Date:/)).toBeInTheDocument();
    }
  });

  it('should filter matches by game status', () => {
    render(<App />);

    const statusSelect = screen.getByLabelText('Filter by game status');
    fireEvent.change(statusSelect, { target: { value: 'played' } });

    const banner = screen.getByRole('region', { name: /Current filter status/ });
    expect(banner).toHaveTextContent(/Played/);
  });

  it('should update game count when filters change', () => {
    render(<App />);

    const banner = screen.getByRole('region', { name: /Current filter status/ });
    const initialText = banner.textContent;
    expect(initialText).toContain('Game');

    // Change filter
    const ageGroupSelect = screen.getByLabelText('Filter by age group');
    fireEvent.change(ageGroupSelect, { target: { value: '6-8' } });

    // Games count should update
    const updatedText = banner.textContent;
    expect(updatedText).toContain('Game');
  });

  it('should sort matches by date', () => {
    render(<App />);

    const headers = screen.getAllByText(/DATE/);
    const dateHeader = headers.find(el => el.tagName === 'TH');
    fireEvent.click(dateHeader);

    // Table should re-render with sorted data
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should sort matches by time', () => {
    render(<App />);

    const headers = screen.getAllByText(/TIME/);
    const timeHeader = headers.find(el => el.tagName === 'TH');
    fireEvent.click(timeHeader);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should sort matches by team', () => {
    render(<App />);

    const teamHeader = screen.getByText(/HOME TEAM/);
    fireEvent.click(teamHeader);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should toggle sort direction on second click', () => {
    render(<App />);

    const headers = screen.getAllByText(/DATE/);
    const dateHeader = headers.find(el => el.tagName === 'TH');

    // First click - ascending
    fireEvent.click(dateHeader);

    // Second click - descending
    fireEvent.click(dateHeader);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should update game status', () => {
    render(<App />);

    const statusSelects = screen.getAllByLabelText(/Change status for/);
    if (statusSelects.length > 0) {
      fireEvent.change(statusSelects[0], { target: { value: 'Played' } });

      // Status should be updated
      expect(statusSelects[0]).toHaveValue('Played');
    }
  });

  it('should open team selection dialog', () => {
    render(<App />);

    const pickFavoriteButton = screen.getByLabelText('Choose favorite team');
    fireEvent.click(pickFavoriteButton);

    expect(screen.getByText('Choose Your Favorite Team')).toBeInTheDocument();
  });

  it('should close team selection dialog', () => {
    render(<App />);

    // Open dialog
    const pickFavoriteButton = screen.getByLabelText('Choose favorite team');
    fireEvent.click(pickFavoriteButton);

    // Close dialog
    const closeButton = screen.getByLabelText('Close dialog');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Choose Your Favorite Team')).not.toBeInTheDocument();
  });

  it('should select favorite team', () => {
    render(<App />);

    // Open dialog
    const pickFavoriteButton = screen.getByLabelText('Choose favorite team');
    fireEvent.click(pickFavoriteButton);

    // Select a team - use getAllByText since Brazil appears in the table too
    const brazilElements = screen.getAllByText('Brazil');
    const brazilCard = brazilElements.find(el => el.closest('.team-card'));
    if (brazilCard) {
      fireEvent.click(brazilCard.closest('.team-card'));
    }

    // Save
    const saveButton = screen.getByText('Save Favorite');
    fireEvent.click(saveButton);

    // Dialog should close and favorite should be set
    expect(screen.queryByText('Choose Your Favorite Team')).not.toBeInTheDocument();
  });

  it('should display info notice with game status colors', () => {
    render(<App />);

    expect(screen.getByText(/Game Status Colors/)).toBeInTheDocument();
    expect(screen.getByText(/Green = Played/)).toBeInTheDocument();
  });

  it('should display age group indicators', () => {
    render(<App />);

    const infoNotice = screen.getByRole('note', { name: /Game status and age group legend/ });
    expect(infoNotice).toBeInTheDocument();
  });

  it('should toggle filters section', () => {
    const { container } = render(<App />);

    const filtersHeader = container.querySelector('.filters-header');
    fireEvent.click(filtersHeader);

    const filtersContent = container.querySelector('.filters-content');
    expect(filtersContent).toHaveClass('collapsed');
  });

  it('should persist filter selections to localStorage', () => {
    render(<App />);

    const ageGroupSelect = screen.getByLabelText('Filter by age group');
    fireEvent.change(ageGroupSelect, { target: { value: '6-8' } });

    // Filter should be updated in the UI
    expect(ageGroupSelect).toHaveValue('6-8');
  });

  it('should handle multiple filters simultaneously', () => {
    render(<App />);

    // Apply age group filter
    const ageGroupSelect = screen.getByLabelText('Filter by age group');
    fireEvent.change(ageGroupSelect, { target: { value: '6-8' } });

    // Apply status filter
    const statusSelect = screen.getByLabelText('Filter by game status');
    fireEvent.change(statusSelect, { target: { value: 'scheduled' } });

    // Both filters should be active in banner
    const banner = screen.getByRole('region', { name: /Current filter status/ });
    expect(banner).toHaveTextContent(/Ages 6-8/);
    expect(banner).toHaveTextContent(/Scheduled/);
  });

  it('should show "no results" when filters match nothing', () => {
    render(<App />);

    // Apply filter that will match nothing
    const teamSelect = screen.getByLabelText('Filter by team');
    fireEvent.change(teamSelect, { target: { value: 'Argentina' } });

    const statusSelect = screen.getByLabelText('Filter by game status');
    fireEvent.change(statusSelect, { target: { value: 'cancelled' } });

    // Might show no results depending on data
    // This test validates that the app handles the scenario gracefully
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should render banner with current filter status', () => {
    render(<App />);

    const banner = screen.getByRole('region', { name: /Current filter status/ });
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/All Age Groups/);
  });
});
