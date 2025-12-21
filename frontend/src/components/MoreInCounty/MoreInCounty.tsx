import { Link } from 'react-router-dom';
import { useCountyLocations } from '../../hooks/useCountyLocations';
import styles from './MoreInCounty.module.css';

interface MoreInCountyProps {
  county: string;
  countySlug: string;
  currentSlug: string;
}

export function MoreInCounty({ county, countySlug, currentSlug }: MoreInCountyProps) {
  const { locations, isLoading } = useCountyLocations(countySlug, currentSlug);

  if (isLoading || locations.length === 0) {
    return null;
  }

  // Show up to 8 locations, plus link to county page
  const displayLocations = locations.slice(0, 8);
  const hasMore = locations.length > 8;

  return (
    <section className={styles.section}>
      <h2 id="more-locations" className={styles.title}>More weather in {county}</h2>
      <div className={styles.grid}>
        {displayLocations.map((location) => (
          <Link
            key={location.slug}
            to={`/weather/${countySlug}/${location.slug}`}
            className={styles.link}
          >
            {location.name}
          </Link>
        ))}
      </div>
      {hasMore && (
        <Link to={`/county/${countySlug}`} className={styles.viewAll}>
          View all {locations.length} locations in {county} →
        </Link>
      )}
    </section>
  );
}
