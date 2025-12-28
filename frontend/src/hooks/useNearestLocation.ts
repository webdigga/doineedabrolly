import { useState, useEffect } from 'react';

const SESSION_CACHE_KEY = 'brolly-nearest-location';
const PERMISSION_CACHE_KEY = 'brolly-geo-permission';

export interface NearestLocation {
  slug: string;
  countySlug: string;
  name: string;
  county: string;
  lat: number;
  lon: number;
}

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable';

interface UseNearestLocationResult {
  nearestLocation: NearestLocation | null;
  isLoading: boolean;
  error: string | null;
  permissionState: PermissionState;
}

function getCachedLocation(): NearestLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {
    // Invalid JSON or sessionStorage unavailable
  }
  return null;
}

function setCachedLocation(location: NearestLocation): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(location));
  } catch {
    // sessionStorage full or unavailable
  }
}

function getCachedPermission(): PermissionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(PERMISSION_CACHE_KEY);
    if (cached === 'denied' || cached === 'granted') {
      return cached as PermissionState;
    }
  } catch {
    // localStorage unavailable
  }
  return null;
}

function setCachedPermission(state: PermissionState): void {
  if (typeof window === 'undefined') return;
  try {
    if (state === 'denied' || state === 'granted') {
      localStorage.setItem(PERMISSION_CACHE_KEY, state);
    } else {
      localStorage.removeItem(PERMISSION_CACHE_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}

export function useNearestLocation(): UseNearestLocationResult {
  const [nearestLocation, setNearestLocation] = useState<NearestLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      setIsLoading(false);
      setPermissionState('unavailable');
      return;
    }

    // Check if geolocation is available
    if (!navigator.geolocation) {
      setIsLoading(false);
      setPermissionState('unavailable');
      return;
    }

    // Check if previously denied
    const cachedPermission = getCachedPermission();
    if (cachedPermission === 'denied') {
      setIsLoading(false);
      setPermissionState('denied');
      return;
    }

    // If permission was previously granted, set state immediately
    // This ensures loading UI shows while GPS acquires position
    if (cachedPermission === 'granted') {
      setPermissionState('granted');
    }

    // Check if we have a cached location from this session
    const cachedLocation = getCachedLocation();
    if (cachedLocation) {
      setNearestLocation(cachedLocation);
      setIsLoading(false);
      setPermissionState('granted');
      return;
    }

    // Use Permissions API to check current state (if available)
    // This helps detect granted permission before GPS position arrives
    const controller = new AbortController();

    const checkPermissionAndGetLocation = async () => {
      // Try to detect permission state early using Permissions API
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          if (permissionStatus.state === 'granted') {
            setPermissionState('granted');
            setCachedPermission('granted');
          } else if (permissionStatus.state === 'denied') {
            setPermissionState('denied');
            setCachedPermission('denied');
            setIsLoading(false);
            return;
          }
          // 'prompt' state - continue to request position
        } catch {
          // Permissions API not fully supported, continue anyway
        }
      }

      // Request geolocation
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setPermissionState('granted');
          setCachedPermission('granted');

          try {
            const response = await fetch(
              `/api/location/nearest?lat=${latitude}&lon=${longitude}`,
              { signal: controller.signal }
            );

            if (!response.ok) {
              throw new Error('Failed to find nearest location');
            }

            const location: NearestLocation = await response.json();
            setNearestLocation(location);
            setCachedLocation(location);
          } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
              return;
            }
            setError('Failed to find nearest location');
          } finally {
            setIsLoading(false);
          }
        },
        async (positionError) => {
          setIsLoading(false);
          if (positionError.code === positionError.PERMISSION_DENIED) {
            // Check actual permission state - dismissing popup also triggers PERMISSION_DENIED
            // but the actual state remains 'prompt', not 'denied'
            let actuallyDenied = true;
            if (navigator.permissions) {
              try {
                const status = await navigator.permissions.query({ name: 'geolocation' });
                actuallyDenied = status.state === 'denied';
              } catch {
                // Permissions API not available, assume denied
              }
            }

            if (actuallyDenied) {
              setPermissionState('denied');
              setCachedPermission('denied');
            } else {
              // User just dismissed the prompt - don't cache, allow retry on next visit
              setPermissionState('prompt');
            }
          } else {
            setError('Unable to get your location');
            setPermissionState('unavailable');
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000, // Cache for 10 minutes
        }
      );
    };

    checkPermissionAndGetLocation();

    return () => {
      controller.abort();
    };
  }, []);

  return { nearestLocation, isLoading, error, permissionState };
}
