import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { WeatherSummary } from '../../components/WeatherSummary/WeatherSummary';
import { CurrentWeather } from '../../components/CurrentWeather/CurrentWeather';
import { HourlyForecast } from '../../components/HourlyForecast/HourlyForecast';
import { DailyForecast } from '../../components/DailyForecast/DailyForecast';
import { MoreInCounty } from '../../components/MoreInCounty/MoreInCounty';
import { WeatherFAQ } from '../../components/WeatherFAQ/WeatherFAQ';
import { WeatherTips } from '../../components/WeatherTips/WeatherTips';
import { WeatherBreadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import { SearchBox } from '../../components/SearchBox/SearchBox';
import { KaboolyBanner } from '../../components/KaboolyBanner/KaboolyBanner';
import { SideBanners } from '../../components/SideBanners/SideBanners';
import { Footer } from '../../components/Footer/Footer';
import { WeatherSEO } from '../../components/SEO/SEO';
import { LocationStructuredData, WeatherArticleStructuredData } from '../../components/SEO/StructuredData';
import styles from './WeatherPage.module.css';

const POPULAR_LOCATIONS = [
  { slug: 'london', countySlug: 'greater-london', name: 'London' },
  { slug: 'manchester', countySlug: 'greater-manchester', name: 'Manchester' },
  { slug: 'birmingham', countySlug: 'west-midlands', name: 'Birmingham' },
  { slug: 'edinburgh', countySlug: 'city-of-edinburgh', name: 'Edinburgh' },
  { slug: 'glasgow', countySlug: 'glasgow-city', name: 'Glasgow' },
  { slug: 'cardiff', countySlug: 'cardiff', name: 'Cardiff' },
];

export function WeatherPage() {
  const { slug } = useParams<{ countySlug: string; slug: string }>();
  const { location, isLoading: locationLoading, notFound } = useLocation(slug);
  const { weather, isLoading: weatherLoading, error } = useWeather(location?.lat, location?.lon);

  // Loading state
  if (locationLoading || weatherLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading weather...</p>
        </div>
      </div>
    );
  }

  // Location not found
  if (notFound) {
    return <LocationNotFound slug={slug} />;
  }

  // Error state
  if (error || !location || !weather) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h1>Something went wrong</h1>
          <p>{error || 'Could not load weather data'}</p>
          <Link to="/" className={styles.backLink}>Try again</Link>
        </div>
      </div>
    );
  }

  const todayHours = weather.daily[0]?.hourly || [];

  return (
    <div className={styles.page}>
      <WeatherSEO
        locationName={location.name}
        county={location.county}
        countySlug={location.countySlug}
        headline={weather.summary.headline}
        slug={location.slug}
      />
      <LocationStructuredData
        locationName={location.name}
        county={location.county}
        countySlug={location.countySlug}
        lat={location.lat}
        lon={location.lon}
        slug={location.slug}
      />
      <WeatherArticleStructuredData
        locationName={location.name}
        county={location.county}
        countySlug={location.countySlug}
        slug={location.slug}
        headline={weather.summary.headline}
        todaySummary={weather.summary.today}
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
        <WeatherBreadcrumbs
          locationName={location.name}
          county={location.county}
          countySlug={location.countySlug}
          slug={location.slug}
        />
        <div className={styles.locationHeader}>
          <h1 className={styles.locationName}>{location.name} Weather</h1>
        </div>

        <WeatherSummary summary={weather.summary} />
        <CurrentWeather current={weather.current} />
        <HourlyForecast hours={todayHours} />
        <DailyForecast days={weather.daily} />
        <WeatherTips
          locationName={location.name}
          current={weather.current}
          today={weather.daily[0]}
        />
        <WeatherFAQ locationName={location.name} weather={weather} />
        {location.county && location.countySlug && (
          <MoreInCounty
            county={location.county}
            countySlug={location.countySlug}
            currentSlug={location.slug}
          />
        )}
      </main>

      <SideBanners />
      <Footer />
    </div>
  );
}

function LocationNotFound({ slug }: { slug: string | undefined }) {
  useEffect(() => {
    // Set noindex for not found pages
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex');

    document.title = 'Location Not Found | Do I Need A Brolly';

    return () => {
      robotsMeta?.remove();
    };
  }, []);

  // Format the slug for display (replace hyphens with spaces, capitalize)
  const displayName = slug
    ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'this location';

  return (
    <div className={styles.page}>
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
        <div className={styles.notFound}>
          <h1>Location not found</h1>
          <p className={styles.notFoundMessage}>
            We couldn't find a location called "{displayName}".
            It might be spelled differently, or try searching for a nearby town.
          </p>

          <div className={styles.notFoundSearch}>
            <h2>Search for your location</h2>
            <p>Find the weather forecast for any town or village in the UK:</p>
            <div className={styles.notFoundSearchBox}>
              <SearchBox placeholder="Enter a town or city..." />
            </div>
          </div>

          <div className={styles.notFoundPopular}>
            <h2>Popular locations</h2>
            <div className={styles.popularLinks}>
              {POPULAR_LOCATIONS.map((loc) => (
                <Link
                  key={loc.slug}
                  to={`/weather/${loc.countySlug}/${loc.slug}`}
                  className={styles.popularLink}
                >
                  {loc.name}
                </Link>
              ))}
            </div>
          </div>

          <p className={styles.notFoundHome}>
            Or go back to the <Link to="/">homepage</Link>.
          </p>
        </div>
      </main>

      <SideBanners />
      <Footer />
    </div>
  );
}
