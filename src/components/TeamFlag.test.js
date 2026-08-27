import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TeamFlag from './TeamFlag';

describe('TeamFlag', () => {
  it('should render team name', () => {
    render(<TeamFlag teamName="Brazil" />);
    expect(screen.getByText('Brazil')).toBeInTheDocument();
  });

  it('should render flag image for valid team', () => {
    render(<TeamFlag teamName="Argentina" />);
    const img = screen.getByRole('presentation');
    expect(img).toHaveAttribute('src', 'https://flagcdn.com/w40/ar.png');
  });

  it('should not render flag for team without flag mapping', () => {
    render(<TeamFlag teamName="Rain Make Up" />);
    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    expect(screen.getByText('Rain Make Up')).toBeInTheDocument();
  });

  it('should hide flag on error', () => {
    render(<TeamFlag teamName="Brazil" />);
    const img = screen.getByRole('presentation');

    // Simulate image load error
    fireEvent.error(img);

    expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
  });

  it('should have correct CSS class', () => {
    const { container } = render(<TeamFlag teamName="Mexico" />);
    const span = container.querySelector('.team-flag-container');
    expect(span).toBeInTheDocument();
  });
});
