import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apply, serve } from '@photonjs/hono';
import { ukLocations, locationsBySlug, locationsByCounty } from '../functions/_shared/ukLocations';
import type { SearchResult, SearchResponse } from '../functions/_shared/types';

// Cache TTLs
const STATIC_CACHE_TTL = 24 * 60 * 60; // 24 hours for static data
const SEARCH_CACHE_TTL = 60 * 60; // 1 hour for search

// Build unique counties list (computed once at startup)
const counties = Array.from(locationsByCounty.entries()).map(([slug, locations]) => ({
  slug,
  name: locations[0].county,
  locationCount: locations.length,
}));

function startServer() {
  const app = new Hono();

  // CORS for API routes
  app.use('/api/*', cors());

  // Health check
  app.get('/api/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Location search
  app.get('/api/location/search', (c) => {
    const query = c.req.query('q')?.toLowerCase().trim() || '';
    const limit = Math.min(parseInt(c.req.query('limit') || '10', 10), 50);

    if (!query) {
      return c.json({ error: 'Query parameter "q" is required' }, 400);
    }

    if (query.length < 2) {
      return c.json({ error: 'Query must be at least 2 characters' }, 400);
    }

    // Search counties
    const countyResults: SearchResult[] = counties
      .filter(county => {
        const name = county.name.toLowerCase();
        return name.startsWith(query) || name.split(/\s+/).some(word => word.startsWith(query));
      })
      .slice(0, 3)
      .map(county => ({
        type: 'county' as const,
        slug: county.slug,
        name: county.name,
        subtitle: `${county.locationCount} locations`,
      }));

    // Search locations
    const locationResults: SearchResult[] = ukLocations
      .filter(loc => loc.name.toLowerCase().startsWith(query))
      .slice(0, limit - countyResults.length)
      .map(loc => ({
        type: 'location' as const,
        slug: loc.slug,
        countySlug: loc.countySlug,
        name: loc.name,
        subtitle: loc.county,
      }));

    const results = [...countyResults, ...locationResults];
    const response: SearchResponse = { results, total: results.length };

    return c.json(response, 200, {
      'Cache-Control': `public, max-age=${SEARCH_CACHE_TTL}, s-maxage=${SEARCH_CACHE_TTL}`,
    });
  });

  // Find nearest location to coordinates (must be before :slug route)
  app.get('/api/location/nearest', (c) => {
    const latStr = c.req.query('lat');
    const lonStr = c.req.query('lon');

    if (!latStr || !lonStr) {
      return c.json({ error: 'lat and lon query parameters are required' }, 400);
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return c.json({ error: 'lat and lon must be valid numbers' }, 400);
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return c.json({ error: 'Invalid coordinates' }, 400);
    }

    // Find nearest location using squared distance (faster than Haversine, accurate enough for nearby points)
    let nearest = ukLocations[0];
    let minDistSq = Infinity;

    for (const loc of ukLocations) {
      const dLat = loc.lat - lat;
      const dLon = loc.lon - lon;
      const distSq = dLat * dLat + dLon * dLon;
      if (distSq < minDistSq) {
        minDistSq = distSq;
        nearest = loc;
      }
    }

    return c.json({
      slug: nearest.slug,
      countySlug: nearest.countySlug,
      name: nearest.name,
      county: nearest.county,
      lat: nearest.lat,
      lon: nearest.lon,
    }, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get location by slug
  app.get('/api/location/:slug', (c) => {
    const slug = c.req.param('slug');
    const location = locationsBySlug.get(slug);

    if (!location) {
      return c.json({ error: 'Location not found' }, 404);
    }

    return c.json(location, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get nearby locations
  app.get('/api/location/:slug/nearby', (c) => {
    const slug = c.req.param('slug');
    const limit = Math.min(parseInt(c.req.query('limit') || '8', 10), 20);

    const location = locationsBySlug.get(slug);
    if (!location) {
      return c.json({ error: 'Location not found' }, 404);
    }

    // Get locations in the same county, excluding current
    const countyLocations = locationsByCounty.get(location.countySlug) || [];
    const nearby = countyLocations
      .filter(loc => loc.slug !== slug)
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limit)
      .map(loc => ({
        slug: loc.slug,
        name: loc.name,
        lat: loc.lat,
        lon: loc.lon,
      }));

    return c.json({ locations: nearby }, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Get county by slug
  app.get('/api/county/:slug', (c) => {
    const slug = c.req.param('slug');
    const locations = locationsByCounty.get(slug);

    if (!locations || locations.length === 0) {
      return c.json({ error: 'County not found' }, 404);
    }

    const countyName = locations[0].county;
    const centerLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const centerLon = locations.reduce((sum, loc) => sum + loc.lon, 0) / locations.length;

    const sortedLocations = [...locations]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(loc => ({
        slug: loc.slug,
        name: loc.name,
        lat: loc.lat,
        lon: loc.lon,
      }));

    return c.json({
      county: {
        slug,
        name: countyName,
        locationCount: locations.length,
        centerLat,
        centerLon,
      },
      locations: sortedLocations,
    }, 200, {
      'Cache-Control': `public, max-age=${STATIC_CACHE_TTL}, s-maxage=${STATIC_CACHE_TTL}`,
    });
  });

  // Install Vike middleware (handles all non-API routes)
  apply(app);

  return serve(app);
}

export default startServer();
