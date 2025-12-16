import { useState, useEffect } from 'react';
import { getLocationBySlug } from '../services/locationService';
import type { Location } from '../types';

interface UseLocationResult {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
}

export function useLocation(slug?: string): UseLocationResult {
  const [location, setLocation] = useState<Location | null>(null);
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

    async function fetchLocation() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await getLocationBySlug(currentSlug);
        if (!cancelled) {
          if (data) {
            setLocation(data);
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch location');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchLocation();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { location, isLoading, error, notFound };
}
