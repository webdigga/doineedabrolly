import { useState, useEffect } from 'react';
import { getWeather } from '../services/weatherService';
import type { WeatherResponse } from '../types';

interface UseWeatherResult {
  weather: WeatherResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useWeather(lat?: number, lon?: number): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat === undefined || lon === undefined) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const currentLat = lat;
    const currentLon = lon;

    async function fetchWeather() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getWeather(currentLat, currentLon, 7);
        if (!cancelled) {
          setWeather(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch weather');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return { weather, isLoading, error };
}
