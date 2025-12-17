import { jsonResponse, errorResponse } from '../../../_shared/response';
import { ukLocations, locationsBySlug } from '../../../_shared/ukLocations';

// Cache nearby lookups for 24 hours (static data)
const EDGE_CACHE_TTL = 24 * 60 * 60;

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

export const onRequestGet: PagesFunction<unknown, 'slug'> = async (context) => {
  const slug = context.params.slug as string;
  const location = locationsBySlug.get(slug);

  if (!location) {
    return errorResponse('Location not found', 404);
  }

  const url = new URL(context.request.url);
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

  return jsonResponse({ results: nearby }, 200, EDGE_CACHE_TTL);
};
