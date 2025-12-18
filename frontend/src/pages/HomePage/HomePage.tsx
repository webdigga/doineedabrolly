import { Link } from 'react-router-dom';
import { SearchBox } from '../../components/SearchBox/SearchBox';
import { LocationLinks } from '../../components/LocationLinks/LocationLinks';
import { KaboolyBanner } from '../../components/KaboolyBanner/KaboolyBanner';
import { SEO } from '../../components/SEO/SEO';
import { WebsiteStructuredData } from '../../components/SEO/StructuredData';
import styles from './HomePage.module.css';

const POPULAR_LOCATIONS = [
  { slug: 'london', name: 'London' },
  { slug: 'manchester', name: 'Manchester' },
  { slug: 'birmingham', name: 'Birmingham' },
  { slug: 'leeds', name: 'Leeds' },
  { slug: 'glasgow', name: 'Glasgow' },
  { slug: 'liverpool', name: 'Liverpool' },
  { slug: 'edinburgh', name: 'Edinburgh' },
  { slug: 'bristol', name: 'Bristol' },
  { slug: 'sheffield', name: 'Sheffield' },
  { slug: 'newcastle-upon-tyne', name: 'Newcastle' },
  { slug: 'nottingham', name: 'Nottingham' },
  { slug: 'cardiff', name: 'Cardiff' },
];

export function HomePage() {
  return (
    <div className={styles.page}>
      <SEO
        title="UK Weather Forecasts in Plain English"
        description="Do I Need A Brolly? Plain English weather forecasts for every town and village in the UK. Find out if you need your umbrella today."
        canonicalPath="/"
      />
      <WebsiteStructuredData />

      <KaboolyBanner />

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Do I Need A Brolly?</h1>
          <p className={styles.subtitle}>
            Plain English weather forecasts for every town and village in the UK
          </p>
        </div>

        <div className={styles.searchWrapper}>
          <SearchBox autoFocus placeholder="Enter your town or city..." />
        </div>

        <p className={styles.hint}>
          Try searching for your town to get today's forecast
        </p>

        <div className={styles.popularSection}>
          <LocationLinks title="Popular locations" locations={POPULAR_LOCATIONS} centered />
        </div>
      </main>

      <footer className={styles.footer}>
        <nav className={styles.footerNav}>
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
        <p>Weather data from <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer">Open-Meteo</a></p>
      </footer>
    </div>
  );
}
