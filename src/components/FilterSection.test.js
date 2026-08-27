import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterSection from './FilterSection';

describe('FilterSection', () => {
  const mockProps = {
    filtersExpanded: true,
    setFiltersExpanded: jest.fn(),
    selectedAgeGroup: 'all',
    setSelectedAgeGroup: jest.fn(),
    selectedField: 'all',
    setSelectedField: jest.fn(),
    selectedTeam: 'all',
    setSelectedTeam: jest.fn(),
    selectedDate: 'all',
    setSelectedDate: jest.fn(),
    showGames: 'all',
    setShowGames: jest.fn(),
    uniqueDates: ['2026-03-14', '2026-03-21'],
    allTeams: ['Argentina', 'Brazil', 'Madagascar']
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render filters section', () => {
    render(<FilterSection {...mockProps} />);
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('should toggle filters when header is clicked', () => {
    render(<FilterSection {...mockProps} />);
    const header = screen.getByRole('button', { name: /Collapse filters/i });
    fireEvent.click(header);

    expect(mockProps.setFiltersExpanded).toHaveBeenCalledWith(false);
  });

  it('should toggle filters on Enter key', () => {
    const { container } = render(<FilterSection {...mockProps} />);
    const header = container.querySelector('.filters-header');
    fireEvent.keyPress(header, { key: 'Enter', charCode: 13 });

    expect(mockProps.setFiltersExpanded).toHaveBeenCalledWith(false);
  });

  it('should toggle filters on Space key', () => {
    const { container } = render(<FilterSection {...mockProps} />);
    const header = container.querySelector('.filters-header');
    fireEvent.keyPress(header, { key: ' ', charCode: 32 });

    expect(mockProps.setFiltersExpanded).toHaveBeenCalledWith(false);
  });

  it('should call setSelectedAgeGroup when age group is changed', () => {
    render(<FilterSection {...mockProps} />);
    const select = screen.getByLabelText('Filter by age group');
    fireEvent.change(select, { target: { value: '6-8' } });

    expect(mockProps.setSelectedAgeGroup).toHaveBeenCalledWith('6-8');
  });

  it('should call setSelectedField when field is changed', () => {
    render(<FilterSection {...mockProps} />);
    const select = screen.getByLabelText('Filter by field location');
    fireEvent.change(select, { target: { value: 'Upper Fields 1-3' } });

    expect(mockProps.setSelectedField).toHaveBeenCalledWith('Upper Fields 1-3');
  });

  it('should call setSelectedTeam when team is changed', () => {
    render(<FilterSection {...mockProps} />);
    const select = screen.getByLabelText('Filter by team');
    fireEvent.change(select, { target: { value: 'Brazil' } });

    expect(mockProps.setSelectedTeam).toHaveBeenCalledWith('Brazil');
  });

  it('should call setSelectedDate when date is changed', () => {
    render(<FilterSection {...mockProps} />);
    const select = screen.getByLabelText('Filter by date');
    fireEvent.change(select, { target: { value: '2026-03-14' } });

    expect(mockProps.setSelectedDate).toHaveBeenCalledWith('2026-03-14');
  });

  it('should call setShowGames when game status is changed', () => {
    render(<FilterSection {...mockProps} />);
    const select = screen.getByLabelText('Filter by game status');
    fireEvent.change(select, { target: { value: 'played' } });

    expect(mockProps.setShowGames).toHaveBeenCalledWith('played');
  });

  it('should render all teams in select', () => {
    render(<FilterSection {...mockProps} />);
    const select = screen.getByLabelText('Filter by team');

    expect(select).toContainHTML('<option value="Argentina">Argentina</option>');
    expect(select).toContainHTML('<option value="Brazil">Brazil</option>');
    expect(select).toContainHTML('<option value="Madagascar">Madagascar</option>');
  });

  it('should render all dates in select', () => {
    render(<FilterSection {...mockProps} />);
    const select = screen.getByLabelText('Filter by date');

    // Dates are formatted, so check for formatted values
    expect(select).toContainHTML('3/14');
    expect(select).toContainHTML('3/21');
  });

  it('should have collapsed class when not expanded', () => {
    const props = { ...mockProps, filtersExpanded: false };
    const { container } = render(<FilterSection {...props} />);

    const content = container.querySelector('.filters-content');
    expect(content).toHaveClass('collapsed');
  });

  it('should have correct aria-expanded attribute', () => {
    const { container } = render(<FilterSection {...mockProps} />);
    const header = container.querySelector('.filters-header');

    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  it('should set aria-hidden on content when collapsed', () => {
    const props = { ...mockProps, filtersExpanded: false };
    const { container } = render(<FilterSection {...props} />);

    const content = container.querySelector('.filters-content');
    expect(content).toHaveAttribute('aria-hidden', 'true');
  });

  it('should disable tab index on filters when collapsed', () => {
    const props = { ...mockProps, filtersExpanded: false };
    render(<FilterSection {...props} />);

    const ageGroupSelect = screen.getByLabelText('Filter by age group');
    expect(ageGroupSelect).toHaveAttribute('tabIndex', '-1');
  });

  it('should enable tab index on filters when expanded', () => {
    render(<FilterSection {...mockProps} />);

    const ageGroupSelect = screen.getByLabelText('Filter by age group');
    expect(ageGroupSelect).toHaveAttribute('tabIndex', '0');
  });

  it('should render all age group options', () => {
    render(<FilterSection {...mockProps} />);
    const select = screen.getByLabelText('Filter by age group');

    expect(select).toContainHTML('<option value="all">All Ages</option>');
    expect(select).toContainHTML('<option value="6-8">Ages 6-8</option>');
    expect(select).toContainHTML('<option value="9-10">Ages 9-10</option>');
    expect(select).toContainHTML('<option value="11-13">Ages 11-13</option>');
  });

  it('should render all game status options', () => {
    render(<FilterSection {...mockProps} />);
    const select = screen.getByLabelText('Filter by game status');

    expect(select).toContainHTML('<option value="all">All Games</option>');
    expect(select).toContainHTML('<option value="scheduled">Scheduled</option>');
    expect(select).toContainHTML('<option value="played">Played</option>');
    expect(select).toContainHTML('<option value="cancelled">Cancelled</option>');
    expect(select).toContainHTML('<option value="rain">Rain Make Ups</option>');
  });
});
