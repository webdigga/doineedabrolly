import { useData } from 'vike-react/useData';
import type { CountyData } from './+data';

const SITE_NAME = 'Do I Need A Brolly';
const DOMAIN = 'https://doineedabrolly.co.uk';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

export function Head() {
  const { county } = useData<CountyData>();

  const title = `${county.name} Weather - All Towns & Villages`;
  const description = `Weather forecasts for ${county.locationCount} towns and villages in ${county.name}. Find plain English weather for any location in ${county.name}.`;
  const canonicalPath = `/county/${county.slug}`;

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

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | ${SITE_NAME}`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </>
  );
}
