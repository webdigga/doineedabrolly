import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '../../components/Layout/Layout';
import { SearchBox } from '../../components/SearchBox/SearchBox';
import styles from './NotFoundPage.module.css';

const POPULAR_LOCATIONS = [
  { slug: 'london', countySlug: 'greater-london', name: 'London' },
  { slug: 'manchester', countySlug: 'greater-manchester', name: 'Manchester' },
  { slug: 'birmingham', countySlug: 'west-midlands', name: 'Birmingham' },
  { slug: 'edinburgh', countySlug: 'city-of-edinburgh', name: 'Edinburgh' },
  { slug: 'glasgow', countySlug: 'glasgow-city', name: 'Glasgow' },
  { slug: 'cardiff', countySlug: 'cardiff', name: 'Cardiff' },
];

export function NotFoundPage() {
  useEffect(() => {
    // Set noindex for 404 pages
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex');

    document.title = 'Page Not Found | Do I Need A Brolly';

    return () => {
      // Clean up noindex when leaving 404 page
      robotsMeta?.remove();
    };
  }, []);

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
                <Link to={`/weather/${loc.countySlug}/${loc.slug}`}>
                  {loc.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.homeLink}>
          Or go back to the <Link to="/">homepage</Link>.
        </p>
      </div>
    </Layout>
  );
}
