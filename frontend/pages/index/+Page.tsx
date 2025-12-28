import { SearchBox } from '../../src/components/SearchBox/SearchBox';
import { KaboolyBanner } from '../../src/components/KaboolyBanner/KaboolyBanner';
import { Footer } from '../../src/components/Footer/Footer';
import { WebsiteStructuredData, OrganizationStructuredData, HowToStructuredData } from '../../src/components/SEO/StructuredData';
import { PersonalisedLocations } from '../../src/components/PersonalisedLocations/PersonalisedLocations';
import styles from '../../src/pages/HomePage/HomePage.module.css';

const POPULAR_LOCATIONS = [
  { slug: 'london', countySlug: 'greater-london', name: 'London' },
  { slug: 'manchester', countySlug: 'greater-manchester', name: 'Manchester' },
  { slug: 'birmingham', countySlug: 'west-midlands', name: 'Birmingham' },
  { slug: 'leeds', countySlug: 'west-yorkshire', name: 'Leeds' },
  { slug: 'glasgow', countySlug: 'glasgow-city', name: 'Glasgow' },
  { slug: 'liverpool', countySlug: 'merseyside', name: 'Liverpool' },
  { slug: 'edinburgh', countySlug: 'city-of-edinburgh', name: 'Edinburgh' },
  { slug: 'bristol', countySlug: 'bristol', name: 'Bristol' },
  { slug: 'sheffield', countySlug: 'south-yorkshire', name: 'Sheffield' },
  { slug: 'newcastle-upon-tyne', countySlug: 'tyne-and-wear', name: 'Newcastle' },
  { slug: 'nottingham', countySlug: 'nottinghamshire', name: 'Nottingham' },
  { slug: 'cardiff', countySlug: 'cardiff', name: 'Cardiff' },
];

export function Page() {
  return (
    <div className={styles.page}>
      <WebsiteStructuredData />
      <OrganizationStructuredData />
      <HowToStructuredData />

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

        <div className={styles.locationsSection}>
          <PersonalisedLocations fallbackLocations={POPULAR_LOCATIONS} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
