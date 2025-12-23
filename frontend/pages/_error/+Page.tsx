import { Layout } from '../../src/components/Layout/Layout';
import { SearchBox } from '../../src/components/SearchBox/SearchBox';
import styles from '../../src/pages/NotFoundPage/NotFoundPage.module.css';

const POPULAR_LOCATIONS = [
  { slug: 'london', countySlug: 'greater-london', name: 'London' },
  { slug: 'manchester', countySlug: 'greater-manchester', name: 'Manchester' },
  { slug: 'birmingham', countySlug: 'west-midlands', name: 'Birmingham' },
  { slug: 'edinburgh', countySlug: 'city-of-edinburgh', name: 'Edinburgh' },
  { slug: 'glasgow', countySlug: 'glasgow-city', name: 'Glasgow' },
  { slug: 'cardiff', countySlug: 'cardiff', name: 'Cardiff' },
];

export function Page() {
  return (
    <Layout>
      <div className={styles.content}>
        <h1>Page not found</h1>
        <p className={styles.message}>
          We couldn't find that page. It might have moved, or perhaps there's a typo in the address.
        </p>

        <div className={styles.searchSection}>
          <h2>Search for your location</h2>
          <p>Find the weather forecast for any town or village in the UK:</p>
          <div className={styles.searchWrapper}>
            <SearchBox placeholder="Enter a town or city..." />
          </div>
        </div>

        <div className={styles.popularSection}>
          <h2>Popular locations</h2>
          <ul className={styles.locationList}>
            {POPULAR_LOCATIONS.map((loc) => (
              <li key={loc.slug}>
                <a href={`/weather/${loc.countySlug}/${loc.slug}`}>
                  {loc.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.homeLink}>
          Or go back to the <a href="/">homepage</a>.
        </p>
      </div>
    </Layout>
  );
}
