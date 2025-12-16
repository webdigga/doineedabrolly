import { config } from '../config';
import type { Location, LocationSearchResponse } from '../types';

/**
 * Search for locations by name prefix
 */
export async function searchLocations(query: string, limit = 10): Promise<Location[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const response = await fetch(`${config.apiBaseUrl}/location/search?${params}`);

  if (!response.ok) {
    throw new Error('Failed to search locations');
  }

  const data: LocationSearchResponse = await response.json();
  return data.results;
}

/**
 * Get a location by its slug
 */
export async function getLocationBySlug(slug: string): Promise<Location | null> {
  const response = await fetch(`${config.apiBaseUrl}/location/${slug}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch location');
  }

  return response.json();
}
