import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
}

const SITE_NAME = 'Do I Need A Brolly';
const DOMAIN = 'https://doineedabrolly.co.uk';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

export function SEO({ title, description, canonicalPath }: SEOProps) {
  useEffect(() => {
    // Set document title
    document.title = `${title} | ${SITE_NAME}`;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update or create canonical link
    if (canonicalPath) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `${DOMAIN}${canonicalPath}`);
    }

    // Open Graph tags
    updateMetaTag('og:title', `${title} | ${SITE_NAME}`);
    updateMetaTag('og:description', description);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:image', OG_IMAGE);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:image:alt', `${title} - Plain English UK Weather Forecast`);
    if (canonicalPath) {
      updateMetaTag('og:url', `${DOMAIN}${canonicalPath}`);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', `${title} | ${SITE_NAME}`);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', OG_IMAGE);

  }, [title, description, canonicalPath]);

  return null;
}

function updateMetaTag(property: string, content: string) {
  const isOg = property.startsWith('og:');
  const selector = isOg
    ? `meta[property="${property}"]`
    : `meta[name="${property}"]`;

  let meta = document.querySelector(selector);
  if (!meta) {
    meta = document.createElement('meta');
    if (isOg) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

interface WeatherSEOProps {
  locationName: string;
  county?: string;
  countySlug?: string;
  headline: string;
  slug: string;
}

export function WeatherSEO({ locationName, county, countySlug, headline, slug }: WeatherSEOProps) {
  const location = county ? `${locationName}, ${county}` : locationName;
  const title = `${locationName} Weather - Today, Tomorrow & 7 Day Forecast`;
  const description = `${location} weather: ${headline}. Get the plain English forecast for today, tomorrow and the week ahead.`;
  const canonicalPath = countySlug ? `/weather/${countySlug}/${slug}` : `/weather/${slug}`;

  return <SEO title={title} description={description} canonicalPath={canonicalPath} />;
}
