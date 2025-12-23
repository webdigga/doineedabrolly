import { useData } from 'vike-react/useData';
import type { WeatherPageData } from './+data';

const SITE_NAME = 'Do I Need A Brolly';
const DOMAIN = 'https://doineedabrolly.co.uk';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

export function Head() {
  const { location, weather } = useData<WeatherPageData>();

  const locationDisplay = location.county ? `${location.name}, ${location.county}` : location.name;
  const title = `${location.name} Weather - Today, Tomorrow & 7 Day Forecast`;
  const description = `${locationDisplay} weather: ${weather.summary.headline}. Get the plain English forecast for today, tomorrow and the week ahead.`;
  const canonicalPath = `/weather/${location.countySlug}/${location.slug}`;

  return (
    <>
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`${DOMAIN}${canonicalPath}`} />

      {/* Open Graph */}
      <meta property="og:title" content={`${title} | ${SITE_NAME}`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`${DOMAIN}${canonicalPath}`} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${location.name} Weather - Plain English UK Weather Forecast`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | ${SITE_NAME}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </>
  );
}
