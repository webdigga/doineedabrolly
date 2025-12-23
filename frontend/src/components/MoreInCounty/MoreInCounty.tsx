import styles from './MoreInCounty.module.css';

interface NearbyLocation {
  slug: string;
  name: string;
}

interface MoreInCountyProps {
  county: string;
  countySlug: string;
  locations: NearbyLocation[];
}

export function MoreInCounty({ county, countySlug, locations }: MoreInCountyProps) {
  if (locations.length === 0) {
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
          <a
            key={location.slug}
            href={`/weather/${countySlug}/${location.slug}`}
            className={styles.link}
          >
            {location.name}
          </a>
        ))}
      </div>
      {hasMore && (
        <a href={`/county/${countySlug}`} className={styles.viewAll}>
          View all {locations.length} locations in {county} →
        </a>
      )}
    </section>
  );
}
