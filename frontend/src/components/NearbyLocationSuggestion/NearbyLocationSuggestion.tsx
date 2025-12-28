import { useNearestLocation } from '../../hooks/useNearestLocation';
import styles from './NearbyLocationSuggestion.module.css';

export function NearbyLocationSuggestion() {
  const { nearestLocation, isLoading, permissionState } = useNearestLocation();

  // Don't render anything during prompt phase (waiting for user to click allow/deny)
  // This prevents CLS - nothing appears until we have a definitive answer
  if (permissionState === 'prompt') {
    return null;
  }

  // Don't render if permission denied or unavailable
  if (permissionState === 'denied' || permissionState === 'unavailable') {
    return null;
  }

  // Permission granted but still fetching nearest location
  if (isLoading && !nearestLocation) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Near You</h2>
        <div className={styles.contentWrapper}>
          <div className={styles.loading}>
            <span className={styles.loadingDot} aria-hidden="true" />
            <span className={styles.loadingText}>Finding your location...</span>
          </div>
        </div>
      </section>
    );
  }

  if (!nearestLocation) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Near You</h2>
      <div className={styles.contentWrapper}>
        <a
          href={`/weather/${nearestLocation.countySlug}/${nearestLocation.slug}`}
          className={styles.locationLink}
        >
          <span className={styles.locationName}>{nearestLocation.name}</span>
          <span className={styles.locationCounty}>{nearestLocation.county}</span>
        </a>
      </div>
    </section>
  );
}
