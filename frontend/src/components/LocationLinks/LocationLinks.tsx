import styles from './LocationLinks.module.css';

interface Location {
  slug: string;
  countySlug?: string;
  name: string;
  county?: string;
}

interface LocationLinksProps {
  title: string;
  locations: Location[];
  showCounty?: boolean;
  centered?: boolean;
}

export function LocationLinks({ title, locations, showCounty = false, centered = false }: LocationLinksProps) {
  if (locations.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={`${styles.title} ${centered ? styles.centered : ''}`}>{title}</h2>
      <div className={`${styles.grid} ${centered ? styles.centered : ''}`}>
        {locations.map((location) => (
          <a
            key={location.slug}
            href={`/weather/${location.countySlug}/${location.slug}`}
            className={styles.link}
          >
            {location.name}
            {showCounty && location.county && (
              <span className={styles.county}>, {location.county}</span>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
