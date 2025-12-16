// Cache TTL in seconds (15 minutes)
export const WEATHER_CACHE_TTL = 15 * 60;

/**
 * Generate a cache key for weather data.
 * Coordinates are rounded to 2 decimal places (~1km precision) to increase cache hits.
 */
export function getWeatherCacheKey(lat: number, lon: number, days: number): string {
  const roundedLat = lat.toFixed(2);
  const roundedLon = lon.toFixed(2);
  return `weather:${roundedLat}:${roundedLon}:${days}`;
}

/**
 * Get cached weather data from the Cache API.
 */
export async function getCachedWeather<T>(cacheKey: string): Promise<T | null> {
  const cache = await caches.open('weather-cache');
  const cacheUrl = new URL(`https://cache.internal/${cacheKey}`);
  const cached = await cache.match(cacheUrl);

  if (!cached) {
    return null;
  }

  try {
    return await cached.json() as T;
  } catch {
    return null;
  }
}

/**
 * Store weather data in the Cache API.
 */
export async function setCachedWeather<T>(cacheKey: string, data: T, ttlSeconds: number): Promise<void> {
  const cache = await caches.open('weather-cache');
  const cacheUrl = new URL(`https://cache.internal/${cacheKey}`);

  const response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `max-age=${ttlSeconds}`,
    },
  });

  await cache.put(cacheUrl, response);
}
