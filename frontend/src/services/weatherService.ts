import { config } from '../config';
import type { WeatherResponse } from '../types';

/**
 * Get weather forecast for given coordinates
 */
export async function getWeather(lat: number, lon: number, days = 7): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    days: days.toString(),
  });

  const response = await fetch(`${config.apiBaseUrl}/weather/${lat}/${lon}?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
}
