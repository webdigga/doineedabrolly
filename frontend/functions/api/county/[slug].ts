import { jsonResponse, errorResponse } from '../../_shared/response';
import { locationsByCounty, ukLocations } from '../../_shared/ukLocations';

// Cache county lookups for 24 hours (static data)
const EDGE_CACHE_TTL = 24 * 60 * 60;

interface County {
  slug: string;
  name: string;
  locationCount: number;
  centerLat: number;
  centerLon: number;
}

interface CountyResponse {
  county: County;
  locations: Array<{
    slug: string;
    name: string;
    lat: number;
    lon: number;
  }>;
}

export const onRequestGet: PagesFunction<unknown, 'slug'> = async (context) => {
  const slug = context.params.slug as string;
  const locations = locationsByCounty.get(slug);

  if (!locations || locations.length === 0) {
    return errorResponse('County not found', 404);
  }

  // Get county name from first location
  const countyName = locations[0].county;

  // Calculate center point (average of all locations)
  const centerLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
  const centerLon = locations.reduce((sum, loc) => sum + loc.lon, 0) / locations.length;

  // Sort locations alphabetically and map to simpler format
  const sortedLocations = [...locations]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(loc => ({
      slug: loc.slug,
      name: loc.name,
      lat: loc.lat,
      lon: loc.lon,
    }));

  const response: CountyResponse = {
    county: {
      slug,
      name: countyName,
      locationCount: locations.length,
      centerLat,
      centerLon,
    },
    locations: sortedLocations,
  };

  return jsonResponse(response, 200, EDGE_CACHE_TTL);
};
