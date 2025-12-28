import { useState, useEffect } from 'react';
import { useFavourites } from '../../hooks/useFavourites';
import { useNearestLocation } from '../../hooks/useNearestLocation';
import styles from './PersonalisedLocations.module.css';

const INITIAL_FAVOURITES = 4;

interface Location {
  slug: string;
  countySlug: string;
  name: string;
  county?: string;
}

interface PersonalisedLocationsProps {
  fallbackLocations: Location[];
  fallbackTitle?: string;
}

export function PersonalisedLocations({
  fallbackLocations,
  fallbackTitle = "Popular locations"
}: PersonalisedLocationsProps) {
  const { favourites } = useFavourites();
  const { nearestLocation, isLoading: isLoadingLocation, permissionState } = useNearestLocation();
  const [isHydrated, setIsHydrated] = useState(false);
  const [showAllFavourites, setShowAllFavourites] = useState(false);

  // Track when hydration completes
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Check if we're in SSR
  const isServer = typeof window === 'undefined';

  // Determine what personalised content we have
  const hasMoreFavourites = favourites.length > INITIAL_FAVOURITES;
  const displayedFavourites = showAllFavourites
    ? favourites
    : favourites.slice(0, INITIAL_FAVOURITES);
  const hasFavourites = favourites.length > 0;
  const hasNearby = permissionState === 'granted' && nearestLocation !== null;
  const isLoadingNearby = permissionState === 'granted' && isLoadingLocation;

  // Show personalised content if we have favourites OR a nearby location
  const hasPersonalisedContent = hasFavourites || hasNearby;

  // During SSR, show skeleton loading state
  if (isServer) {
    return (
      <section className={styles.section} aria-label="Loading locations">
        <div className={styles.skeleton}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonPills}>
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
          </div>
        </div>
      </section>
    );
  }

  // Show skeleton until hydration completes (prevents flash)
  if (!isHydrated) {
    return (
      <section className={styles.section} aria-label="Loading locations">
        <div className={styles.skeleton}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonPills}>
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
          </div>
        </div>
      </section>
    );
  }

  // Client-side: show personalised content if available, otherwise fallback
  if (!hasPersonalisedContent && !isLoadingNearby) {
    return (
      <section className={styles.section} aria-label={fallbackTitle}>
        <h2 className={styles.title}>{fallbackTitle}</h2>
        <div className={styles.popularList}>
          {fallbackLocations.map((loc) => (
            <a
              key={`${loc.countySlug}-${loc.slug}`}
              href={`/weather/${loc.countySlug}/${loc.slug}`}
              className={styles.popularLink}
            >
              {loc.name}
            </a>
          ))}
        </div>
      </section>
    );
  }

  // Show personalised content
  return (
    <section className={styles.section} aria-label="Your locations">
      {hasFavourites && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>
            <span className={styles.icon} aria-hidden="true">&#9733;</span>
            Favourites
          </h2>
          {displayedFavourites.length === 1 ? (
            <div className={styles.nearbyItem}>
              <a
                href={`/weather/${displayedFavourites[0].countySlug}/${displayedFavourites[0].slug}`}
                className={styles.nearbyLink}
              >
                <span className={styles.locationName}>{displayedFavourites[0].name}</span>
                <span className={styles.locationCounty}>{displayedFavourites[0].county}</span>
              </a>
            </div>
          ) : (
            <div className={styles.locationList}>
              {displayedFavourites.map((loc) => (
                <a
                  key={`${loc.countySlug}-${loc.slug}`}
                  href={`/weather/${loc.countySlug}/${loc.slug}`}
                  className={styles.locationLink}
                >
                  <span className={styles.locationName}>{loc.name}</span>
                  <span className={styles.locationCounty}>{loc.county}</span>
                </a>
              ))}
            </div>
          )}
          {hasMoreFavourites && (
            <button
              type="button"
              onClick={() => setShowAllFavourites(!showAllFavourites)}
              className={styles.showMoreButton}
            >
              {showAllFavourites
                ? 'Show less'
                : `Show all ${favourites.length}`}
            </button>
          )}
        </div>
      )}

      {(hasNearby || isLoadingNearby) && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>
            <svg className={styles.locationIcon} aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Near You
          </h2>
          <div className={styles.nearbyItem}>
            {isLoadingNearby ? (
              <div className={styles.loadingPill}>
                <span className={styles.loadingDot} aria-hidden="true" />
                Finding location...
              </div>
            ) : nearestLocation ? (
              <a
                href={`/weather/${nearestLocation.countySlug}/${nearestLocation.slug}`}
                className={styles.nearbyLink}
              >
                <span className={styles.locationName}>{nearestLocation.name}</span>
                <span className={styles.locationCounty}>{nearestLocation.county}</span>
              </a>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
