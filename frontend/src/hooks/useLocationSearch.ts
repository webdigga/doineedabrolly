import { useState, useEffect } from 'react';
import type { SearchResult, SearchResponse } from '../../functions/_shared/types';

interface UseLocationSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
}

export function useLocationSearch(): UseLocationSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't search for very short queries
    if (query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `/api/location/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data: SearchResponse = await response.json();
        setResults(data.results);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        setError('Failed to search locations');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(fetchResults, 200);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  return { query, setQuery, results, isLoading, error };
}
