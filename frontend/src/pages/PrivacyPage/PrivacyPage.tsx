import { Layout } from '../../components/Layout/Layout';
import { SEO } from '../../components/SEO/SEO';
import styles from './PrivacyPage.module.css';

export function PrivacyPage() {
  return (
    <Layout>
      <SEO
        title="Privacy Policy"
        description="Privacy policy for Do I Need A Brolly - how we handle your data."
        canonicalPath="/privacy"
      />

      <article className={styles.content}>
        <h1>Privacy Policy</h1>

        <p className={styles.updated}>Last updated: December 2025</p>

        <h2>Overview</h2>

        <p>
          Do I Need A Brolly ("we", "us", "our") is committed to protecting your
          privacy. This policy explains how we collect, use, and protect your
          information when you use our website at doineedabrolly.co.uk.
        </p>

        <h2>Information we collect</h2>

        <h3>Information you provide</h3>

        <p>
          We do not require you to create an account or provide any personal
          information to use our service.
        </p>

        <h3>Automatically collected information</h3>

        <p>
          We use Cloudflare Web Analytics to understand how visitors use our
          site. This is a privacy-focused analytics service that:
        </p>

        <ul>
          <li>Does not use cookies</li>
          <li>Does not track individual users</li>
          <li>Does not collect personal information</li>
          <li>Anonymizes all data</li>
        </ul>

        <p>
          We can see aggregate statistics such as page views, referring
          websites, and general browser/device types, but we cannot identify
          individual visitors.
        </p>

        <h3>Location data</h3>

        <p>
          When you search for a location, we use the location name to fetch
          weather data. We do not store your search history.
        </p>

        <h2>How we use your information</h2>

        <p>We use collected information to:</p>

        <ul>
          <li>Provide weather forecasts for requested locations</li>
          <li>Improve our website and service</li>
          <li>Analyse usage patterns</li>
          <li>Ensure security and prevent abuse</li>
        </ul>

        <h2>Cookies</h2>

        <p>
          This website does not use cookies. We do not use tracking cookies,
          analytics cookies, or advertising cookies. Our analytics provider
          (Cloudflare Web Analytics) is cookieless by design.
        </p>

        <h2>Third-party services</h2>

        <p>We use the following third-party services:</p>

        <ul>
          <li>
            <strong>WeatherAPI.com</strong> - Weather data provider. When you view
            a weather forecast, we request data from WeatherAPI.com using the
            location's coordinates (not your personal location).
          </li>
          <li>
            <strong>Cloudflare</strong> - Website hosting, security, and
            privacy-focused web analytics. Cloudflare Web Analytics does not
            use cookies or track individual users.
          </li>
        </ul>

        <p>
          Each of these services has their own privacy policy governing how they
          handle data.
        </p>

        <h2>Data retention</h2>

        <p>
          We retain server logs for up to 30 days. Weather data is cached
          temporarily (up to 15 minutes) to improve performance.
        </p>

        <h2>Your rights</h2>

        <p>
          Because we use privacy-focused, cookieless analytics and do not
          collect personal information, we do not hold any data that identifies
          you as an individual.
        </p>

        <h2>Changes to this policy</h2>

        <p>
          We may update this privacy policy from time to time. We will notify
          you of any changes by posting the new policy on this page.
        </p>
      </article>
    </Layout>
  );
}
