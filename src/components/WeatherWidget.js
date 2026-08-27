import React from 'react';
import { getWeatherEmoji } from '../utils/helpers';

/**
 * WeatherWidget component - Displays current weather information
 */
const WeatherWidget = ({ weather }) => {
  if (!weather) {
    return null;
  }

  return (
    <span
      className="weather-widget"
      aria-label={`Current weather: ${weather.temp} degrees Fahrenheit, ${weather.condition}`}
    >
      <span aria-hidden="true">{getWeatherEmoji(weather.condition)}</span>
      <span>{weather.temp}°F</span>
      <span className="weather-condition">
        {weather.condition}
      </span>
    </span>
  );
};

export default WeatherWidget;
