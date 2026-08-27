import React from 'react';
import { render, screen } from '@testing-library/react';
import WeatherWidget from './WeatherWidget';

describe('WeatherWidget', () => {
  it('should render nothing when weather is null', () => {
    const { container } = render(<WeatherWidget weather={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render weather information when provided', () => {
    const weather = {
      temp: '72',
      condition: 'Sunny'
    };

    render(<WeatherWidget weather={weather} />);

    expect(screen.getByText('72°F')).toBeInTheDocument();
    expect(screen.getByText('Sunny')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    const weather = {
      temp: '65',
      condition: 'Cloudy'
    };

    const { container } = render(<WeatherWidget weather={weather} />);
    const widget = container.querySelector('.weather-widget');

    expect(widget).toHaveAttribute(
      'aria-label',
      'Current weather: 65 degrees Fahrenheit, Cloudy'
    );
  });

  it('should render weather emoji', () => {
    const weather = {
      temp: '80',
      condition: 'Clear'
    };

    const { container } = render(<WeatherWidget weather={weather} />);
    expect(container.textContent).toContain('☀️');
  });

  it('should render condition text', () => {
    const weather = {
      temp: '55',
      condition: 'Rainy'
    };

    const { container } = render(<WeatherWidget weather={weather} />);
    const conditionElement = container.querySelector('.weather-condition');

    expect(conditionElement).toHaveTextContent('Rainy');
  });
});
