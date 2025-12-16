import { ukLocations, locationsBySlug } from '../data/ukLocations';

export interface LocationResponse {
  slug: string;
  name: string;
  county: string;
  countySlug: string;
  lat: number;
  lon: number;
}

export interface SearchResponse {
  results: LocationResponse[];
  total: number;
}

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
 * GET /api/location/search?q=query&limit=10
 * Search locations by name prefix
 */
export function handleLocationSearch(request: Request): Response {
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.toLowerCase().trim() || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);

  if (!query) {
    return errorResponse('Query parameter "q" is required');
  }

  if (query.length < 2) {
    return errorResponse('Query must be at least 2 characters');
  }

  const results = ukLocations
    .filter(loc => loc.name.toLowerCase().startsWith(query))
    .slice(0, limit);

  const response: SearchResponse = {
    results,
    total: results.length,
  };

  return jsonResponse(response);
}

/**
 * GET /api/location/:slug
 * Get a single location by its slug
 */
export function handleLocationBySlug(slug: string): Response {
  const location = locationsBySlug.get(slug);

  if (!location) {
    return errorResponse('Location not found', 404);
  }

  return jsonResponse(location);
}

/**
 * GET /api/location/:slug/nearby?limit=6
 * Get nearby locations to a given location
 */
export function handleNearbyLocations(slug: string, request: Request): Response {
  const location = locationsBySlug.get(slug);

  if (!location) {
    return errorResponse('Location not found', 404);
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '6', 10), 20);

  // Calculate distances and sort
  const nearby = ukLocations
    .filter(loc => loc.slug !== slug)
    .map(loc => ({
      ...loc,
      distance: haversineDistance(location.lat, location.lon, loc.lat, loc.lon),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ distance, ...loc }) => loc);

  return jsonResponse({ results: nearby });
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
