import type { PageContextServer } from 'vike/types';
import { locationsByCounty } from '../../../../functions/_shared/ukLocations';
import { getWeather } from '../../../../functions/_shared/weatherService';
import { generateSummary } from '../../../../functions/_shared/plainEnglish';
import type { Location, WeatherResponse } from '../../../../functions/_shared/types';

// Get API key from Cloudflare Workers env (production) or process.env (dev)
async function getApiKey(): Promise<string | undefined> {
  // Try Cloudflare Workers env first (production)
  try {
    const cfWorkers = await import('cloudflare:workers');
    if (cfWorkers.env?.WEATHER_API_KEY) {
      return cfWorkers.env.WEATHER_API_KEY as string;
    }
  } catch {
    // Not in Cloudflare runtime - expected in dev mode
  }

  // Fallback to process.env for dev mode (reads from .dev.vars via dotenv or Node env)
  if (typeof process !== 'undefined' && process.env?.WEATHER_API_KEY) {
    return process.env.WEATHER_API_KEY;
  }

  return undefined;
}

interface NearbyLocation {
  slug: string;
  name: string;
}

export interface WeatherPageData {
  location: Location;
  weather: WeatherResponse;
  nearbyLocations: NearbyLocation[];
}

export async function data(pageContext: PageContextServer): Promise<WeatherPageData> {
  const { slug, countySlug } = pageContext.routeParams;

  // Get locations in this county first, then find the specific location
  // This handles duplicate slugs across counties (e.g., "Bradford" in both West Yorkshire and Greater Manchester)
  const countyLocations = locationsByCounty.get(countySlug);

  if (!countyLocations || countyLocations.length === 0) {
    throw { notFound: true };
  }

  const location = countyLocations.find(loc => loc.slug === slug);

  if (!location) {
    throw { notFound: true };
  }

  // Get nearby locations in the same county (excluding current)
  const nearbyLocations = countyLocations
    .filter(loc => loc.slug !== slug)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(loc => ({ slug: loc.slug, name: loc.name }));

  // Get API key from environment
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('Weather API key not configured');
  }

  // Fetch weather data
  const forecast = await getWeather(location.lat, location.lon, 7, apiKey);
  const summary = generateSummary(forecast);

  const weather: WeatherResponse = {
    ...forecast,
    summary,
  };

  return {
    location,
    weather,
    nearbyLocations,
  };
}
