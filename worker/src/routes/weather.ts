import { getWeather } from '../services/weatherService';
import { generateSummary } from '../utils/plainEnglish';
import type { WeatherResponse } from '../types';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

/**
 * GET /api/weather/:lat/:lon?days=7
 * Get weather forecast for coordinates
 */
export async function handleWeatherRequest(
  lat: string,
  lon: string,
  request: Request
): Promise<Response> {
  const url = new URL(request.url);

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
    const forecast = await getWeather(latitude, longitude, days);
    const summary = generateSummary(forecast);

    const response: WeatherResponse = {
      ...forecast,
      summary,
    };

    return jsonResponse(response);
  } catch (error) {
    console.error('Weather API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch weather data';
    return errorResponse(message, 500);
  }
}
