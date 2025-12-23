import type { PageContextServer } from 'vike/types';
import { locationsByCounty } from '../../../functions/_shared/ukLocations';

interface County {
  slug: string;
  name: string;
  locationCount: number;
  centerLat: number;
  centerLon: number;
}

interface CountyLocation {
  slug: string;
  name: string;
  lat: number;
  lon: number;
}

export interface CountyData {
  county: County;
  locations: CountyLocation[];
}

export async function data(pageContext: PageContextServer): Promise<CountyData> {
  const { countySlug } = pageContext.routeParams;
  const locations = locationsByCounty.get(countySlug);

  if (!locations || locations.length === 0) {
    throw { notFound: true };
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

  return {
    county: {
      slug: countySlug,
      name: countyName,
      locationCount: locations.length,
      centerLat,
      centerLon,
    },
    locations: sortedLocations,
  };
}
