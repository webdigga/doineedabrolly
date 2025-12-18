import { jsonResponse, errorResponse } from '../../_shared/response';
import { ukLocations, locationsByCounty } from '../../_shared/ukLocations';
import type { SearchResponse, SearchResult } from '../../_shared/types';

// Cache location searches for 1 hour (static data)
const EDGE_CACHE_TTL = 60 * 60;

// Build unique counties list
const counties = Array.from(locationsByCounty.entries()).map(([slug, locations]) => ({
  slug,
  name: locations[0].county,
  locationCount: locations.length,
}));

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const query = url.searchParams.get('q')?.toLowerCase().trim() || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);

  if (!query) {
    return errorResponse('Query parameter "q" is required');
  }

  if (query.length < 2) {
    return errorResponse('Query must be at least 2 characters');
  }

  // Search counties (match if name starts with query OR any word starts with query)
  const countyResults: SearchResult[] = counties
    .filter(c => {
      const name = c.name.toLowerCase();
      return name.startsWith(query) || name.split(/\s+/).some(word => word.startsWith(query));
    })
    .slice(0, 3)
    .map(c => ({
      type: 'county' as const,
      slug: c.slug,
      name: c.name,
      subtitle: `${c.locationCount} locations`,
    }));

  // Search locations
  const locationResults: SearchResult[] = ukLocations
    .filter(loc => loc.name.toLowerCase().startsWith(query))
    .slice(0, limit - countyResults.length)
    .map(loc => ({
      type: 'location' as const,
      slug: loc.slug,
      name: loc.name,
      subtitle: loc.county,
    }));

  const results = [...countyResults, ...locationResults];

  const response: SearchResponse = {
    results,
    total: results.length,
  };

  return jsonResponse(response, 200, EDGE_CACHE_TTL);
};
