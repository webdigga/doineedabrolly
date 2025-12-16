import { useState, useEffect, useRef } from 'react';
import { searchLocations } from '../services/locationService';
import type { Location } from '../types';

interface UseLocationSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: Location[];
  isLoading: boolean;
  error: string | null;
}

export function useLocationSearch(debounceMs = 200): UseLocationSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Clear results if query is too short
    if (query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Debounce the search
    const timeoutId = setTimeout(async () => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const locations = await searchLocations(query);
        setResults(locations);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Failed to search locations');
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [query, debounceMs]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
  };
}
