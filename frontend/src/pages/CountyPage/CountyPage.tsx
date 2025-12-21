import { useParams, Link } from 'react-router-dom';
import { useCounty } from '../../hooks/useCounty';
import { useWeather } from '../../hooks/useWeather';
import { SearchBox } from '../../components/SearchBox/SearchBox';
import { KaboolyBanner } from '../../components/KaboolyBanner/KaboolyBanner';
import { Footer } from '../../components/Footer/Footer';
import { SEO } from '../../components/SEO/SEO';
import { CountyStructuredData } from '../../components/SEO/StructuredData';
import { CountyBreadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import styles from './CountyPage.module.css';

export function CountyPage() {
  const { countySlug } = useParams<{ countySlug: string }>();
  const { county, locations, isLoading, notFound } = useCounty(countySlug);
  const { weather } = useWeather(county?.centerLat, county?.centerLon);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <KaboolyBanner />
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !county) {
    return (
      <div className={styles.page}>
        <KaboolyBanner />
        <div className={styles.error}>
          <h1>County not found</h1>
          <p>We couldn't find that county. Try searching for a location instead.</p>
          <Link to="/" className={styles.backLink}>Go to homepage</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Get current weather summary if available
  const currentTemp = weather?.current?.temperature;
  const weatherHeadline = weather?.summary?.headline;

  return (
    <div className={styles.page}>
      <SEO
        title={`${county.name} Weather - All Towns & Villages`}
        description={`Weather forecasts for ${county.locationCount} towns and villages in ${county.name}. Find plain English weather for any location in ${county.name}.`}
        canonicalPath={`/county/${county.slug}`}
      />
      <CountyStructuredData
        countyName={county.name}
        slug={county.slug}
        locationCount={county.locationCount}
      />

      <KaboolyBanner />

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>Do I Need A Brolly?</Link>
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
          {weatherHeadline && (
            <p className={styles.currentWeather}>
              {currentTemp !== undefined && `${Math.round(currentTemp)}°C · `}
              {weatherHeadline}
            </p>
          )}
        </div>

        <section className={styles.locationsSection}>
          <h2 className={styles.sectionTitle}>All locations in {county.name}</h2>
          <p className={styles.sectionDescription}>
            Select a town or village to see the detailed weather forecast
          </p>

          <div className={styles.locationsGrid}>
            {locations.map((location) => (
              <Link
                key={location.slug}
                to={`/weather/${countySlug}/${location.slug}`}
                className={styles.locationLink}
              >
                {location.name}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
