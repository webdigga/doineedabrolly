import { useState, useEffect } from 'react';
import { config } from '../config';

interface CountyLocation {
  slug: string;
  name: string;
  lat: number;
  lon: number;
}

interface County {
  slug: string;
  name: string;
  locationCount: number;
  centerLat: number;
  centerLon: number;
}

interface CountyData {
  county: County;
  locations: CountyLocation[];
}

interface UseCountyResult {
  county: County | null;
  locations: CountyLocation[];
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useCounty(slug?: string): UseCountyResult {
  const [county, setCounty] = useState<County | null>(null);
  const [locations, setLocations] = useState<CountyLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const currentSlug = slug;

    async function fetchCounty() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const response = await fetch(`${config.apiBaseUrl}/county/${currentSlug}`);

        if (response.status === 404) {
          if (!cancelled) {
            setNotFound(true);
          }
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch county');
        }

        const data: CountyData = await response.json();

        if (!cancelled) {
          setCounty(data.county);
          setLocations(data.locations);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch county');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchCounty();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { county, locations, isLoading, error, notFound };
}
