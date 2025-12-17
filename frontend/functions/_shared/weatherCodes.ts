/**
 * WMO Weather interpretation codes (WW)
 * https://open-meteo.com/en/docs#weathervariables
 */

export const weatherDescriptions: Record<number, string> = {
  0: 'clear skies',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'foggy',
  48: 'freezing fog',
  51: 'light drizzle',
  53: 'drizzle',
  55: 'heavy drizzle',
  56: 'freezing drizzle',
  57: 'heavy freezing drizzle',
  61: 'light rain',
  63: 'rain',
  65: 'heavy rain',
  66: 'freezing rain',
  67: 'heavy freezing rain',
  71: 'light snow',
  73: 'snow',
  75: 'heavy snow',
  77: 'snow grains',
  80: 'light showers',
  81: 'showers',
  82: 'heavy showers',
  85: 'light snow showers',
  86: 'snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with hail',
  99: 'severe thunderstorm with hail',
};

export function getWeatherDescription(code: number): string {
  return weatherDescriptions[code] || 'unknown conditions';
}

/**
 * Check if a weather code indicates rain/precipitation
 */
export function isRainyCode(code: number): boolean {
  return (
    (code >= 51 && code <= 67) || // Drizzle and rain
    (code >= 80 && code <= 82) || // Showers
    (code >= 95 && code <= 99)    // Thunderstorms
  );
}

/**
 * Check if a weather code indicates snow
 */
export function isSnowyCode(code: number): boolean {
  return (
    (code >= 71 && code <= 77) || // Snow
    (code >= 85 && code <= 86)    // Snow showers
  );
}

/**
 * Check if conditions are generally "nice" (clear/partly cloudy, no precip)
 */
export function isNiceCode(code: number): boolean {
  return code <= 2;
}
