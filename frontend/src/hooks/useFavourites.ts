import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'brolly-favourites';

export interface FavouriteLocation {
  slug: string;
  countySlug: string;
  name: string;
  county: string;
}

interface UseFavouritesResult {
  favourites: FavouriteLocation[];
  addFavourite: (location: FavouriteLocation) => void;
  removeFavourite: (slug: string, countySlug: string) => void;
  isFavourite: (slug: string, countySlug: string) => boolean;
  toggleFavourite: (location: FavouriteLocation) => void;
}

function loadFavourites(): FavouriteLocation[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Invalid JSON, reset
  }
  return [];
}

function saveFavourites(favourites: FavouriteLocation[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  } catch {
    // localStorage full or unavailable
  }
}

export function useFavourites(): UseFavouritesResult {
  const [favourites, setFavourites] = useState<FavouriteLocation[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    setFavourites(loadFavourites());
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever favourites change (after initial load)
  useEffect(() => {
    if (isInitialized) {
      saveFavourites(favourites);
    }
  }, [favourites, isInitialized]);

  const addFavourite = useCallback((location: FavouriteLocation) => {
    setFavourites((prev) => {
      // Check if already exists
      const exists = prev.some(
        (f) => f.slug === location.slug && f.countySlug === location.countySlug
      );
      if (exists) {
        return prev;
      }
      return [...prev, location];
    });
  }, []);

  const removeFavourite = useCallback((slug: string, countySlug: string) => {
    setFavourites((prev) =>
      prev.filter((f) => !(f.slug === slug && f.countySlug === countySlug))
    );
  }, []);

  const isFavourite = useCallback(
    (slug: string, countySlug: string): boolean => {
      return favourites.some(
        (f) => f.slug === slug && f.countySlug === countySlug
      );
    },
    [favourites]
  );

  const toggleFavourite = useCallback(
    (location: FavouriteLocation) => {
      if (isFavourite(location.slug, location.countySlug)) {
        removeFavourite(location.slug, location.countySlug);
      } else {
        addFavourite(location);
      }
    },
    [isFavourite, removeFavourite, addFavourite]
  );

  return { favourites, addFavourite, removeFavourite, isFavourite, toggleFavourite };
}
