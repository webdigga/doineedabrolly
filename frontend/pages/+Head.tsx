export function Head() {
  return (
    <>
      {/* Preconnect for faster font loading */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap"
        rel="stylesheet"
      />

      {/* Google verification */}
      <meta name="google-site-verification" content="43lj_-i9IykGj-2_d63WSp6rfnxcpb2RfdOlIJ5XpS4" />

      {/* Language alternates */}
      <link rel="alternate" hrefLang="en-GB" href="https://doineedabrolly.co.uk/" />
      <link rel="alternate" hrefLang="x-default" href="https://doineedabrolly.co.uk/" />

      {/* Default Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_GB" />
      <meta property="og:site_name" content="Do I Need A Brolly" />

      {/* PWA Meta Tags */}
      <meta name="theme-color" content="#0066cc" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Brolly" />

      {/* Icons */}
      <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
    </>
  );
}
