import { getForecast as getWeatherApiForecast } from './weatherApi';
import { getCachedWeather, setCachedWeather, getWeatherCacheKey, WEATHER_CACHE_TTL } from './cache';
import type { Forecast } from './types';

/**
 * Get weather forecast for given coordinates.
 * Uses caching to reduce API calls - coordinates are rounded to 2 decimal places.
 */
export async function getWeather(lat: number, lon: number, days: number = 7, apiKey?: string): Promise<Forecast> {
  // Validate inputs
  if (lat < -90 || lat > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90');
  }
  if (lon < -180 || lon > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180');
  }
  if (days < 1 || days > 14) {
    throw new Error('Invalid days: must be between 1 and 14');
  }

  const cacheKey = getWeatherCacheKey(lat, lon, days);

  // Try to get from cache first
  const cached = await getCachedWeather<Forecast>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch fresh data from WeatherAPI.com
  const forecast = await getWeatherApiForecast(lat, lon, days, apiKey);

  // Cache the result
  await setCachedWeather(cacheKey, forecast, WEATHER_CACHE_TTL);

  return forecast;
}
