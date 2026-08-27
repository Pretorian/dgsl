import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ScheduleTable from './ScheduleTable';

describe('ScheduleTable', () => {
  const mockMatches = [
    {
      date: '2026-03-14',
      time: '9:00',
      ageGroup: '6-8',
      team1: 'Argentina',
      team2: 'Brazil',
      field: 'Upper Fields 1-3'
    },
    {
      date: '2026-03-21',
      time: '10:00',
      ageGroup: '9-10',
      team1: 'Madagascar',
      team2: 'Egypt',
      field: 'Upper Fields 1-3'
    }
  ];

  const mockProps = {
    filteredMatches: mockMatches,
    getGameStatus: jest.fn(() => 'Scheduled'),
    updateGameStatus: jest.fn(),
    sortConfig: { key: null, direction: 'asc' },
    handleSort: jest.fn(),
    getSortIndicator: jest.fn(() => ' ↕')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render table with matches', () => {
    render(<ScheduleTable {...mockProps} />);

    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('Madagascar')).toBeInTheDocument();
    expect(screen.getByText('Egypt')).toBeInTheDocument();
  });

  it('should render table headers', () => {
    render(<ScheduleTable {...mockProps} />);

    expect(screen.getByText(/DATE/)).toBeInTheDocument();
    expect(screen.getByText(/TIME/)).toBeInTheDocument();
    expect(screen.getByText(/AGE GROUP/)).toBeInTheDocument();
    expect(screen.getByText(/FIELD/)).toBeInTheDocument();
    expect(screen.getByText(/HOME TEAM/)).toBeInTheDocument();
    expect(screen.getByText(/AWAY TEAM/)).toBeInTheDocument();
    expect(screen.getByText(/LOCATION/)).toBeInTheDocument();
    expect(screen.getByText(/STATUS/)).toBeInTheDocument();
  });

  it('should call handleSort when sortable header is clicked', () => {
    render(<ScheduleTable {...mockProps} />);

    const dateHeader = screen.getByText(/DATE/);
    fireEvent.click(dateHeader);

    expect(mockProps.handleSort).toHaveBeenCalledWith('date');
  });

  it('should call handleSort when sortable header is activated with Enter key', () => {
    render(<ScheduleTable {...mockProps} />);

    const timeHeader = screen.getByText(/TIME/);
    fireEvent.keyPress(timeHeader, { key: 'Enter', charCode: 13 });

    expect(mockProps.handleSort).toHaveBeenCalledWith('time');
  });

  it('should display formatted dates', () => {
    render(<ScheduleTable {...mockProps} />);

    expect(screen.getByText('3/14')).toBeInTheDocument();
    expect(screen.getByText('3/21')).toBeInTheDocument();
  });

  it('should display game times', () => {
    render(<ScheduleTable {...mockProps} />);

    expect(screen.getByText('9:00')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('should call updateGameStatus when status select changes', () => {
    render(<ScheduleTable {...mockProps} />);

    const statusSelects = screen.getAllByLabelText(/Change status for/);
    fireEvent.change(statusSelects[0], { target: { value: 'Played' } });

    expect(mockProps.updateGameStatus).toHaveBeenCalledWith(mockMatches[0], 'Played');
  });

  it('should display "Merrick-Moore" location for all matches', () => {
    render(<ScheduleTable {...mockProps} />);

    const locations = screen.getAllByText('Merrick-Moore');
    expect(locations).toHaveLength(mockMatches.length);
  });

  it('should render "no results" message when no matches', () => {
    const props = { ...mockProps, filteredMatches: [] };
    render(<ScheduleTable {...props} />);

    expect(screen.getByText('No matches found matching your filters')).toBeInTheDocument();
  });

  it('should apply correct row class for Played status', () => {
    const getStatus = jest.fn(() => 'Played');
    const props = { ...mockProps, getGameStatus: getStatus };
    const { container } = render(<ScheduleTable {...props} />);

    const rows = container.querySelectorAll('.table-row-played');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should apply correct row class for Cancelled status', () => {
    const getStatus = jest.fn(() => 'Cancelled');
    const props = { ...mockProps, getGameStatus: getStatus };
    const { container } = render(<ScheduleTable {...props} />);

    const rows = container.querySelectorAll('.table-row-cancelled');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should apply correct row class for Rain Make Up status', () => {
    const getStatus = jest.fn(() => 'Rain Make Up');
    const props = { ...mockProps, getGameStatus: getStatus };
    const { container } = render(<ScheduleTable {...props} />);

    const rows = container.querySelectorAll('.table-row-rain');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('should apply alternating row classes for scheduled games', () => {
    const { container } = render(<ScheduleTable {...mockProps} />);

    const evenRows = container.querySelectorAll('.table-row-even');
    const oddRows = container.querySelectorAll('.table-row-odd');

    expect(evenRows.length + oddRows.length).toBe(mockMatches.length);
  });

  it('should render status select with all options', () => {
    render(<ScheduleTable {...mockProps} />);

    const statusSelects = screen.getAllByLabelText(/Change status for/);
    const firstSelect = statusSelects[0];

    expect(firstSelect).toContainHTML('<option value="Scheduled">Scheduled</option>');
    expect(firstSelect).toContainHTML('<option value="Played">Played</option>');
    expect(firstSelect).toContainHTML('<option value="Cancelled">Cancelled</option>');
    expect(firstSelect).toContainHTML('<option value="Rain Make Up">Rain Make Up</option>');
  });

  it('should call getSortIndicator for sortable columns', () => {
    render(<ScheduleTable {...mockProps} />);

    expect(mockProps.getSortIndicator).toHaveBeenCalledWith('date');
    expect(mockProps.getSortIndicator).toHaveBeenCalledWith('time');
    expect(mockProps.getSortIndicator).toHaveBeenCalledWith('team1');
  });

  it('should have correct aria-sort attribute when sorted', () => {
    const props = {
      ...mockProps,
      sortConfig: { key: 'date', direction: 'asc' }
    };

    const { container } = render(<ScheduleTable {...props} />);
    const dateHeader = screen.getByText(/DATE/).closest('th');

    expect(dateHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  it('should have correct aria-sort for descending sort', () => {
    const props = {
      ...mockProps,
      sortConfig: { key: 'time', direction: 'desc' }
    };

    const { container } = render(<ScheduleTable {...props} />);
    const timeHeader = screen.getByText(/TIME/).closest('th');

    expect(timeHeader).toHaveAttribute('aria-sort', 'descending');
  });

  it('should render age group badges with correct colors', () => {
    const { container } = render(<ScheduleTable {...mockProps} />);

    const badges = container.querySelectorAll('.age-group-badge');
    expect(badges.length).toBeGreaterThan(0);
  });
});
