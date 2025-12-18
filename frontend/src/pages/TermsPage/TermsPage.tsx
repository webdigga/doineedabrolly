import { Layout } from '../../components/Layout/Layout';
import { SEO } from '../../components/SEO/SEO';
import styles from './TermsPage.module.css';

export function TermsPage() {
  return (
    <Layout>
      <SEO
        title="Terms of Service"
        description="Terms of service for Do I Need A Brolly - conditions for using our weather forecast service."
        canonicalPath="/terms"
      />

      <article className={styles.content}>
        <h1>Terms of Service</h1>

        <p className={styles.updated}>Last updated: December 2025</p>

        <h2>Agreement to terms</h2>

        <p>
          By accessing or using Do I Need A Brolly ("the Service"), you agree
          to be bound by these Terms of Service. If you do not agree to these
          terms, please do not use the Service.
        </p>

        <h2>Description of service</h2>

        <p>
          Do I Need A Brolly provides weather forecasts and summaries for
          locations in the United Kingdom. The Service is provided free of
          charge and is intended for personal, non-commercial use.
        </p>

        <h2>Weather information disclaimer</h2>

        <p>
          Weather forecasts are provided for informational purposes only. While
          we strive to provide accurate information, weather forecasting is
          inherently uncertain. We make no guarantees about the accuracy of
          forecasts.
        </p>

        <p>
          <strong>
            Do not rely solely on our forecasts for safety-critical decisions.
          </strong>{' '}
          Always check official sources for severe weather warnings and safety
          information.
        </p>

        <h2>Acceptable use</h2>

        <p>You agree not to:</p>

        <ul>
          <li>
            Use automated systems to scrape or extract data from the Service
          </li>
          <li>
            Attempt to interfere with or disrupt the Service
          </li>
          <li>
            Use the Service for any unlawful purpose
          </li>
          <li>
            Redistribute our content without permission
          </li>
        </ul>

        <h2>Intellectual property</h2>

        <p>
          The Service, including its design, text, and graphics, is owned by us
          and protected by copyright laws. Weather data is provided by
          third-party sources and is subject to their terms.
        </p>

        <h2>Third-party content</h2>

        <p>
          The Service may contain links to third-party websites. We are not
          responsible for the content or practices of these sites.
        </p>

        <h2>Limitation of liability</h2>

        <p>
          To the fullest extent permitted by law, we shall not be liable for
          any indirect, incidental, special, or consequential damages arising
          from your use of the Service.
        </p>

        <p>
          We do not guarantee that the Service will be available at all times
          or free from errors.
        </p>

        <h2>Changes to service</h2>

        <p>
          We reserve the right to modify, suspend, or discontinue the Service
          at any time without notice.
        </p>

        <h2>Changes to terms</h2>

        <p>
          We may update these terms from time to time. Continued use of the
          Service after changes constitutes acceptance of the new terms.
        </p>

        <h2>Governing law</h2>

        <p>
          These terms are governed by the laws of England and Wales. Any
          disputes shall be subject to the exclusive jurisdiction of the
          English courts.
        </p>

        <h2>Contact</h2>

        <p>
          For questions about these terms, contact us at{' '}
          <a href="mailto:hello@doineedabrolly.co.uk">hello@doineedabrolly.co.uk</a>
        </p>
      </article>
    </Layout>
  );
}
