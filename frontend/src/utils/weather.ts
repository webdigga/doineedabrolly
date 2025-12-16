/**
 * WMO Weather code descriptions
 */
export const weatherDescriptions: Record<number, string> = {
  0: 'Clear',
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

export function getWeatherDescription(code: number): string {
  return weatherDescriptions[code] || 'Unknown';
}

/**
 * Get weather icon/emoji for a weather code
 */
export function getWeatherIcon(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '⛅' : '☁️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '🌨️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}

/**
 * Format temperature with degree symbol
 */
export function formatTemp(temp: number): string {
  return `${Math.round(temp)}°`;
}

/**
 * Format time from ISO string to hour (e.g., "3pm")
 */
export function formatHour(isoTime: string): string {
  const date = new Date(isoTime);
  const hour = date.getHours();
  if (hour === 0) return '12am';
  if (hour === 12) return '12pm';
  if (hour < 12) return `${hour}am`;
  return `${hour - 12}pm`;
}

/**
 * Format date to day name (e.g., "Monday")
 */
export function formatDayName(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
}

/**
 * Format date to short format (e.g., "Mon 16")
 */
export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
}
