import { handleLocationSearch, handleLocationBySlug, handleNearbyLocations } from './routes/location';
import { handleWeatherRequest } from './routes/weather';

export interface Env {
  ENVIRONMENT: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // Health check
    if (pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Location search: GET /api/location/search?q=query
    if (pathname === '/api/location/search' && request.method === 'GET') {
      return handleLocationSearch(request);
    }

    // Nearby locations: GET /api/location/:slug/nearby
    const nearbyMatch = pathname.match(/^\/api\/location\/([a-z0-9-]+)\/nearby$/);
    if (nearbyMatch && request.method === 'GET') {
      return handleNearbyLocations(nearbyMatch[1], request);
    }

    // Location by slug: GET /api/location/:slug
    const locationMatch = pathname.match(/^\/api\/location\/([a-z0-9-]+)$/);
    if (locationMatch && request.method === 'GET') {
      return handleLocationBySlug(locationMatch[1]);
    }

    // Weather: GET /api/weather/:lat/:lon?days=7
    const weatherMatch = pathname.match(/^\/api\/weather\/(-?[\d.]+)\/(-?[\d.]+)$/);
    if (weatherMatch && request.method === 'GET') {
      return handleWeatherRequest(weatherMatch[1], weatherMatch[2], request);
    }

    return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
  },
} satisfies ExportedHandler<Env>;
