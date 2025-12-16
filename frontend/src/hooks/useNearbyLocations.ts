import { useState, useEffect } from 'react';

interface Location {
  slug: string;
  name: string;
  county: string;
  countySlug: string;
  lat: number;
  lon: number;
}

interface UseNearbyLocationsResult {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
}

export function useNearbyLocations(slug: string | undefined): UseNearbyLocationsResult {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLocations([]);
      return;
    }

    const currentSlug = slug;

    async function fetchNearby() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/location/${currentSlug}/nearby?limit=6`);

        if (!response.ok) {
          throw new Error('Failed to fetch nearby locations');
        }

        const data = await response.json();

        if (currentSlug === slug) {
          setLocations(data.results || []);
        }
      } catch (err) {
        if (currentSlug === slug) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLocations([]);
        }
      } finally {
        if (currentSlug === slug) {
          setIsLoading(false);
        }
      }
    }

    fetchNearby();
  }, [slug]);

  return { locations, isLoading, error };
}
