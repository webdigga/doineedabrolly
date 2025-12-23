import { useData } from 'vike-react/useData';
import type { CountyData } from './+data';
import { SearchBox } from '../../../src/components/SearchBox/SearchBox';
import { KaboolyBanner } from '../../../src/components/KaboolyBanner/KaboolyBanner';
import { Footer } from '../../../src/components/Footer/Footer';
import { CountyStructuredData } from '../../../src/components/SEO/StructuredData';
import { CountyBreadcrumbs } from '../../../src/components/Breadcrumbs/Breadcrumbs';
import styles from '../../../src/pages/CountyPage/CountyPage.module.css';

export function Page() {
  const { county, locations } = useData<CountyData>();

  return (
    <div className={styles.page}>
      <CountyStructuredData
        countyName={county.name}
        slug={county.slug}
        locationCount={county.locationCount}
      />

      <KaboolyBanner />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <a href="/" className={styles.logo}>Do I Need A Brolly?</a>
          <div className={styles.searchWrapper}>
            <SearchBox placeholder="Search location..." />
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <CountyBreadcrumbs countyName={county.name} countySlug={county.slug} />

        <div className={styles.countyHeader}>
          <h1 className={styles.countyName}>{county.name} Weather</h1>
          <p className={styles.locationCount}>
            {county.locationCount} towns and villages
          </p>
        </div>

        <section className={styles.locationsSection}>
          <h2 className={styles.sectionTitle}>All locations in {county.name}</h2>
          <p className={styles.sectionDescription}>
            Select a town or village to see the detailed weather forecast
          </p>

          <div className={styles.locationsGrid}>
            {locations.map((location, index) => (
              <a
                key={`${location.slug}-${index}`}
                href={`/weather/${county.slug}/${location.slug}`}
                className={styles.locationLink}
              >
                {location.name}
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
