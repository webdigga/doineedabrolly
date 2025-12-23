import { Layout } from '../../src/components/Layout/Layout';
import { StaticPageStructuredData } from '../../src/components/SEO/StructuredData';
import styles from '../../src/pages/AboutPage/AboutPage.module.css';

export function Page() {
  return (
    <Layout>
      <StaticPageStructuredData
        pageType="AboutPage"
        name="About Do I Need A Brolly"
        description="Learn about Do I Need A Brolly - plain English weather forecasts for every town and village in the UK."
        path="/about"
      />

      <article className={styles.content}>
        <h1>About Do I Need A Brolly</h1>

        <p>
          We believe checking the weather should be simple. Instead of deciphering
          numbers and percentages, we give you plain English answers to the only
          question that matters: <strong>do I need a brolly?</strong>
        </p>

        <h2>What makes us different</h2>

        <p>
          Most weather sites show you data: "14°C, 60% precipitation, 15km/h winds".
          That's useful if you're a meteorologist, but most of us just want to know
          if we'll get wet on the school run.
        </p>

        <p>
          We translate weather data into summaries you can actually use:
        </p>

        <ul>
          <li>"Dry until mid-afternoon, rain from 3pm"</li>
          <li>"A wet start, brightening up by lunchtime"</li>
          <li>"Saturday looks better than Sunday"</li>
          <li>"You'll need your brolly after 2pm"</li>
        </ul>

        <h2>Coverage</h2>

        <p>
          We cover every town, village, and locality in the UK - over 40,000
          locations. Whether you're in central London or a tiny hamlet in the
          Scottish Highlands, we've got your forecast.
        </p>

        <h2>Our data</h2>

        <p>
          Weather forecasts are powered by{' '}
          <a href="https://www.weatherapi.com" target="_blank" rel="noopener noreferrer">
            WeatherAPI.com
          </a>
          , providing accurate and up-to-date weather data for locations across
          the UK.
        </p>

        <p>
          Location data comes from Ordnance Survey's Open Names dataset.
        </p>

      </article>
    </Layout>
  );
}
