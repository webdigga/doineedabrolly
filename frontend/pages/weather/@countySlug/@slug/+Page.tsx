import { useData } from 'vike-react/useData';
import type { WeatherPageData } from './+data';
import { WeatherSummary } from '../../../../src/components/WeatherSummary/WeatherSummary';
import { CurrentWeather } from '../../../../src/components/CurrentWeather/CurrentWeather';
import { HourlyForecast } from '../../../../src/components/HourlyForecast/HourlyForecast';
import { DailyForecast } from '../../../../src/components/DailyForecast/DailyForecast';
import { MoreInCounty } from '../../../../src/components/MoreInCounty/MoreInCounty';
import { WeatherFAQ } from '../../../../src/components/WeatherFAQ/WeatherFAQ';
import { WeatherTips } from '../../../../src/components/WeatherTips/WeatherTips';
import { WeatherBreadcrumbs } from '../../../../src/components/Breadcrumbs/Breadcrumbs';
import { SearchBox } from '../../../../src/components/SearchBox/SearchBox';
import { KaboolyBanner } from '../../../../src/components/KaboolyBanner/KaboolyBanner';
import { SideBanners } from '../../../../src/components/SideBanners/SideBanners';
import { Footer } from '../../../../src/components/Footer/Footer';
import { LocationStructuredData, WeatherArticleStructuredData } from '../../../../src/components/SEO/StructuredData';
import { FavouriteButton } from '../../../../src/components/FavouriteButton/FavouriteButton';
import styles from '../../../../src/pages/WeatherPage/WeatherPage.module.css';

export function Page() {
  const { location, weather, nearbyLocations } = useData<WeatherPageData>();

  const todayHours = weather.daily[0]?.hourly || [];

  return (
    <div className={styles.page}>
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
          <a href="/" className={styles.logo}>Do I Need A Brolly?</a>
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
          <h1 className={styles.locationName}>
            {location.name} Weather
            <FavouriteButton
              location={{
                slug: location.slug,
                countySlug: location.countySlug,
                name: location.name,
                county: location.county,
              }}
            />
          </h1>
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
            locations={nearbyLocations}
          />
        )}
      </main>

      <SideBanners />
      <Footer />
    </div>
  );
}
