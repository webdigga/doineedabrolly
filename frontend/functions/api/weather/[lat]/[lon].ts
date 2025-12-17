import { jsonResponse, errorResponse } from '../../../_shared/response';
import { getWeather } from '../../../_shared/weatherService';
import { generateSummary } from '../../../_shared/plainEnglish';
import type { WeatherResponse } from '../../../_shared/types';

// Cache weather responses at edge for 30 minutes
const EDGE_CACHE_TTL = 30 * 60;

interface Env {
  WEATHER_API_KEY: string;
}

interface Params {
  lat: string;
  lon: string;
}

export const onRequestGet: PagesFunction<Env, 'lat' | 'lon'> = async (context) => {
  const { lat, lon } = context.params as Params;
  const url = new URL(context.request.url);
  const apiKey = context.env.WEATHER_API_KEY;

  if (!apiKey) {
    return errorResponse('Weather API key not configured', 500);
  }

  // Parse coordinates
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return errorResponse('Invalid coordinates');
  }

  if (latitude < -90 || latitude > 90) {
    return errorResponse('Latitude must be between -90 and 90');
  }

  if (longitude < -180 || longitude > 180) {
    return errorResponse('Longitude must be between -180 and 180');
  }

  // Parse days parameter (default 7, max 14)
  const daysParam = url.searchParams.get('days');
  let days = 7;

  if (daysParam) {
    days = parseInt(daysParam, 10);
    if (isNaN(days) || days < 1 || days > 14) {
      return errorResponse('Days must be between 1 and 14');
    }
  }

  try {
    const forecast = await getWeather(latitude, longitude, days, apiKey);
    const summary = generateSummary(forecast);

    const response: WeatherResponse = {
      ...forecast,
      summary,
    };

    // Cache at Cloudflare edge for 30 minutes
    return jsonResponse(response, 200, EDGE_CACHE_TTL);
  } catch (error) {
    console.error('Weather API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch weather data';
    return errorResponse(message, 500);
  }
};
