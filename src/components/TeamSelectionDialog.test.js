import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamSelectionDialog from './TeamSelectionDialog';

describe('TeamSelectionDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectTeam = jest.fn();
  const allTeams = ['Argentina', 'Brazil', 'Madagascar', 'Egypt', 'Rain Make Up'];

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSelectTeam.mockClear();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <TeamSelectionDialog
        isOpen={false}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    expect(screen.getByText('Choose Your Favorite Team')).toBeInTheDocument();
  });

  it('should render all teams except "Rain Make Up"', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('Madagascar')).toBeInTheDocument();
    expect(screen.queryByText('Rain Make Up')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const closeButton = screen.getByLabelText('Close dialog');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay is clicked', () => {
    const { container } = render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const overlay = container.querySelector('.dialog-overlay');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when dialog content is clicked', () => {
    const { container } = render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const dialogContent = container.querySelector('.dialog-content');
    fireEvent.click(dialogContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should select a team when clicked', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const brazilCard = screen.getByText('Brazil').closest('.team-card');
    fireEvent.click(brazilCard);

    expect(brazilCard).toHaveClass('selected');
  });

  it('should call onSelectTeam and onClose when Save button is clicked', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const brazilCard = screen.getByText('Brazil').closest('.team-card');
    fireEvent.click(brazilCard);

    const saveButton = screen.getByText('Save Favorite');
    fireEvent.click(saveButton);

    expect(mockOnSelectTeam).toHaveBeenCalledWith('Brazil');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should clear favorite when Clear button is clicked', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite="Brazil"
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const clearButton = screen.getByText('Clear Favorite');
    fireEvent.click(clearButton);

    expect(mockOnSelectTeam).toHaveBeenCalledWith(null);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show current favorite as selected', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite="Argentina"
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const argentinaCard = screen.getByText('Argentina').closest('.team-card');
    expect(argentinaCard).toHaveClass('selected');
  });

  it('should handle keyboard navigation with Enter key', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const brazilCard = screen.getByText('Brazil').closest('.team-card');
    fireEvent.keyDown(brazilCard, { key: 'Enter' });

    expect(brazilCard).toHaveClass('selected');
  });

  it('should handle keyboard navigation with Space key', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const brazilCard = screen.getByText('Brazil').closest('.team-card');
    fireEvent.keyDown(brazilCard, { key: ' ' });

    expect(brazilCard).toHaveClass('selected');
  });

  it('should close on Escape key', () => {
    render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have correct ARIA attributes', () => {
    const { container } = render(
      <TeamSelectionDialog
        isOpen={true}
        onClose={mockOnClose}
        currentFavorite={null}
        onSelectTeam={mockOnSelectTeam}
        allTeams={allTeams}
      />
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'team-dialog-title');
  });
});
