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

/**
 * Get weather code priority for determining most significant weather
 * Higher = more significant/notable (precipitation takes priority)
 */
function getWeatherCodePriority(code: number): number {
  if (code >= 95) return 100; // Thunderstorms - highest priority
  if (code >= 80) return 80;  // Showers
  if (code >= 71) return 70;  // Snow
  if (code >= 61) return 60;  // Rain
  if (code >= 51) return 50;  // Drizzle
  if (code >= 45) return 40;  // Fog
  if (code === 3) return 10;  // Overcast
  if (code >= 1) return 5;    // Partly cloudy
  return 0;                   // Clear
}

/**
 * Filter hourly data to remaining hours from currentHour onwards
 */
function filterRemainingHours<T extends { time: string }>(
  hourly: T[],
  currentHour: number
): T[] {
  return hourly.filter(h => {
    const hour = new Date(h.time).getHours();
    return hour >= currentHour;
  });
}

/**
 * Get representative weather code from remaining hours of today
 * Returns the most significant weather code from hours >= currentHour
 */
export function getRemainingWeatherCode(
  hourly: Array<{ time: string; weatherCode: number }>,
  currentHour: number
): number {
  const remainingHours = filterRemainingHours(hourly, currentHour);

  if (remainingHours.length === 0) {
    return 0; // Default to clear if no hours remaining
  }

  // Find the most significant weather code
  let mostSignificant = remainingHours[0].weatherCode;
  let highestPriority = getWeatherCodePriority(mostSignificant);

  for (const hour of remainingHours) {
    const priority = getWeatherCodePriority(hour.weatherCode);
    if (priority > highestPriority) {
      highestPriority = priority;
      mostSignificant = hour.weatherCode;
    }
  }

  return mostSignificant;
}

/**
 * Get max precipitation probability from remaining hours of today
 */
export function getRemainingMaxPrecipitation(
  hourly: Array<{ time: string; precipitationProbability: number }>,
  currentHour: number
): number {
  const remainingHours = filterRemainingHours(hourly, currentHour);

  if (remainingHours.length === 0) {
    return 0;
  }

  return Math.max(...remainingHours.map(h => h.precipitationProbability));
}
