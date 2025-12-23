const SITE_NAME = 'Do I Need A Brolly';
const DOMAIN = 'https://doineedabrolly.co.uk';
const OG_IMAGE = `${DOMAIN}/og-image.png`;

const title = 'UK Weather Forecasts in Plain English';
const description = 'Do I Need A Brolly? Plain English weather forecasts for every town and village in the UK. Find out if you need your umbrella today.';

export function Head() {
  return (
    <>
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={DOMAIN} />

      {/* Open Graph */}
      <meta property="og:title" content={`${title} | ${SITE_NAME}`} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={DOMAIN} />
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
