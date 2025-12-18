import { useParams, Link } from 'react-router-dom';
import { useLocation } from '../../hooks/useLocation';
import { useWeather } from '../../hooks/useWeather';
import { WeatherSummary } from '../../components/WeatherSummary/WeatherSummary';
import { CurrentWeather } from '../../components/CurrentWeather/CurrentWeather';
import { HourlyForecast } from '../../components/HourlyForecast/HourlyForecast';
import { DailyForecast } from '../../components/DailyForecast/DailyForecast';
import { NearbyLocations } from '../../components/NearbyLocations/NearbyLocations';
import { WeatherFAQ } from '../../components/WeatherFAQ/WeatherFAQ';
import { WeatherTips } from '../../components/WeatherTips/WeatherTips';
import { WeatherBreadcrumbs } from '../../components/Breadcrumbs/Breadcrumbs';
import { SearchBox } from '../../components/SearchBox/SearchBox';
import { KaboolyBanner } from '../../components/KaboolyBanner/KaboolyBanner';
import { Footer } from '../../components/Footer/Footer';
import { WeatherSEO } from '../../components/SEO/SEO';
import { LocationStructuredData } from '../../components/SEO/StructuredData';
import styles from './WeatherPage.module.css';

export function WeatherPage() {
  const { slug } = useParams<{ slug: string }>();
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
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h1>Location not found</h1>
          <p>We couldn't find a location called "{slug}".</p>
          <Link to="/" className={styles.backLink}>Search for a location</Link>
        </div>
      </div>
    );
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
        headline={weather.summary.headline}
        slug={location.slug}
      />
      <LocationStructuredData
        locationName={location.name}
        county={location.county}
        lat={location.lat}
        lon={location.lon}
        slug={location.slug}
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
          slug={location.slug}
        />
        <div className={styles.locationHeader}>
          <h1 className={styles.locationName}>{location.name} Weather</h1>
          {location.county && (
            <p className={styles.county}>
              <Link to={`/county/${location.countySlug}`} className={styles.countyLink}>
                {location.county}
              </Link>
            </p>
          )}
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
        <NearbyLocations slug={location.slug} />
      </main>

      <Footer />
    </div>
  );
}
