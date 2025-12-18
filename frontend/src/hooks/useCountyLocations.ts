import { useState, useEffect } from 'react';
import { config } from '../config';

interface CountyLocation {
  slug: string;
  name: string;
}

interface UseCountyLocationsResult {
  locations: CountyLocation[];
  isLoading: boolean;
}

export function useCountyLocations(countySlug?: string, excludeSlug?: string): UseCountyLocationsResult {
  const [locations, setLocations] = useState<CountyLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!countySlug) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchLocations() {
      setIsLoading(true);

      try {
        const response = await fetch(`${config.apiBaseUrl}/county/${countySlug}`);

        if (!response.ok) {
          setLocations([]);
          return;
        }

        const data = await response.json();

        if (!cancelled) {
          // Filter out current location and return
          const filtered = data.locations.filter(
            (loc: CountyLocation) => loc.slug !== excludeSlug
          );
          setLocations(filtered);
        }
      } catch {
        if (!cancelled) {
          setLocations([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, [countySlug, excludeSlug]);

  return { locations, isLoading };
}
