import type { HourlyForecast } from '../../functions/_shared/types';

/**
 * Get weather icon emoji for a weather code
 */
export function getWeatherIcon(code: number, isDay: boolean): string {
  // Clear
  if (code === 0) return isDay ? '☀️' : '🌙';
  // Mainly clear
  if (code === 1) return isDay ? '🌤️' : '🌙';
  // Partly cloudy
  if (code === 2) return isDay ? '⛅' : '☁️';
  // Overcast
  if (code === 3) return '☁️';
  // Fog
  if (code === 45 || code === 48) return '🌫️';
  // Drizzle
  if (code >= 51 && code <= 57) return '🌧️';
  // Rain
  if (code >= 61 && code <= 67) return '🌧️';
  // Snow
  if (code >= 71 && code <= 77) return '🌨️';
  // Showers
  if (code >= 80 && code <= 82) return '🌦️';
  // Snow showers
  if (code >= 85 && code <= 86) return '🌨️';
  // Thunderstorm
  if (code >= 95) return '⛈️';

  return '🌡️';
}

/**
 * Get weather description for a weather code
 */
export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear skies',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Freezing fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Freezing drizzle',
    57: 'Heavy freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light showers',
    81: 'Showers',
    82: 'Heavy showers',
    85: 'Light snow showers',
    86: 'Snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm',
  };
  return descriptions[code] || 'Unknown';
}

/**
 * Format temperature with degree symbol
 */
export function formatTemp(temp: number): string {
  return `${Math.round(temp)}°`;
}

/**
 * Format time string to hour display (e.g., "2pm", "10am")
 */
export function formatHour(time: string): string {
  const date = new Date(time);
  const hour = date.getHours();
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

/**
 * Format date to day name (e.g., "Monday", "Tuesday")
 */
export function formatDayName(date: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date(date).getDay()];
}

/**
 * Get the weather code for remaining hours of the day
 */
export function getRemainingWeatherCode(hourly: HourlyForecast[], currentHour: number): number {
  const remaining = hourly.filter(h => new Date(h.time).getHours() >= currentHour);
  if (remaining.length === 0) return hourly[0]?.weatherCode || 0;

  // Return the most severe weather code from remaining hours
  const codes = remaining.map(h => h.weatherCode);
  // Prioritize rain/storm codes
  const severeCode = codes.find(c => c >= 95) ||
                     codes.find(c => c >= 61 && c <= 67) ||
                     codes.find(c => c >= 51 && c <= 57) ||
                     codes[0];
  return severeCode || 0;
}

/**
 * Get max precipitation probability for remaining hours
 */
export function getRemainingMaxPrecipitation(hourly: HourlyForecast[], currentHour: number): number {
  const remaining = hourly.filter(h => new Date(h.time).getHours() >= currentHour);
  if (remaining.length === 0) return 0;
  return Math.max(...remaining.map(h => h.precipitationProbability));
}
