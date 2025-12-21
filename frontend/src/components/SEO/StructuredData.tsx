import { useEffect } from 'react';

interface LocationStructuredDataProps {
  locationName: string;
  county?: string;
  countySlug?: string;
  lat: number;
  lon: number;
  slug: string;
}

export function LocationStructuredData({
  locationName,
  county,
  countySlug,
  lat,
  lon,
  slug,
}: LocationStructuredDataProps) {
  useEffect(() => {
    const url = countySlug
      ? `https://doineedabrolly.co.uk/weather/${countySlug}/${slug}`
      : `https://doineedabrolly.co.uk/weather/${slug}`;
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${locationName} Weather Forecast`,
      description: `Plain English weather forecast for ${locationName}${county ? `, ${county}` : ''}`,
      url,
      mainEntity: {
        '@type': 'Place',
        name: locationName,
        address: {
          '@type': 'PostalAddress',
          addressRegion: county || undefined,
          addressCountry: 'GB',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: lat,
          longitude: lon,
        },
      },
    };

    // Remove existing structured data
    const existing = document.querySelector('script[data-structured-data="location"]');
    if (existing) {
      existing.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'location');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [locationName, county, countySlug, lat, lon, slug]);

  return null;
}

interface WebsiteStructuredDataProps {
  searchUrl?: string;
}

export function WebsiteStructuredData({ searchUrl }: WebsiteStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Do I Need A Brolly',
      url: 'https://doineedabrolly.co.uk',
      description: 'Plain English weather forecasts for every town and village in the UK',
      potentialAction: searchUrl
        ? {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `https://doineedabrolly.co.uk/weather/{search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          }
        : undefined,
    };

    const existing = document.querySelector('script[data-structured-data="website"]');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'website');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [searchUrl]);

  return null;
}

interface CountyStructuredDataProps {
  countyName: string;
  slug: string;
  locationCount: number;
}

export function CountyStructuredData({
  countyName,
  slug,
  locationCount,
}: CountyStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${countyName} Weather - All Towns & Villages`,
      description: `Weather forecasts for ${locationCount} towns and villages in ${countyName}`,
      url: `https://doineedabrolly.co.uk/county/${slug}`,
      mainEntity: {
        '@type': 'AdministrativeArea',
        name: countyName,
        containedInPlace: {
          '@type': 'Country',
          name: 'United Kingdom',
        },
      },
    };

    const existing = document.querySelector('script[data-structured-data="county"]');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'county');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [countyName, slug, locationCount]);

  return null;
}

export function OrganizationStructuredData() {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Do I Need A Brolly',
      url: 'https://doineedabrolly.co.uk',
      logo: 'https://doineedabrolly.co.uk/favicon.svg',
      description: 'Plain English weather forecasts for every town and village in the UK',
      foundingDate: '2025',
      slogan: 'Plain English weather for the UK',
      knowsAbout: ['weather forecasting', 'UK weather', 'meteorology'],
      areaServed: {
        '@type': 'Country',
        name: 'United Kingdom',
      },
    };

    const existing = document.querySelector('script[data-structured-data="organization"]');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'organization');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}

interface StaticPageStructuredDataProps {
  pageType: 'AboutPage' | 'WebPage';
  name: string;
  description: string;
  path: string;
}

export function StaticPageStructuredData({
  pageType,
  name,
  description,
  path,
}: StaticPageStructuredDataProps) {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': pageType,
      name,
      description,
      url: `https://doineedabrolly.co.uk${path}`,
      inLanguage: 'en-GB',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Do I Need A Brolly',
        url: 'https://doineedabrolly.co.uk',
      },
    };

    const existing = document.querySelector('script[data-structured-data="static-page"]');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'static-page');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [pageType, name, description, path]);

  return null;
}

interface WeatherArticleStructuredDataProps {
  locationName: string;
  county?: string;
  countySlug?: string;
  slug: string;
  headline: string;
  todaySummary: string;
}

export function WeatherArticleStructuredData({
  locationName,
  county,
  countySlug,
  slug,
  headline,
  todaySummary,
}: WeatherArticleStructuredDataProps) {
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const url = countySlug
      ? `https://doineedabrolly.co.uk/weather/${countySlug}/${slug}`
      : `https://doineedabrolly.co.uk/weather/${slug}`;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${locationName} Weather: ${headline}`,
      description: todaySummary,
      datePublished: today,
      dateModified: today,
      author: {
        '@type': 'Organization',
        name: 'Do I Need A Brolly',
        url: 'https://doineedabrolly.co.uk',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Do I Need A Brolly',
        url: 'https://doineedabrolly.co.uk',
        logo: {
          '@type': 'ImageObject',
          url: 'https://doineedabrolly.co.uk/favicon.svg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      about: {
        '@type': 'Place',
        name: locationName,
        address: {
          '@type': 'PostalAddress',
          addressRegion: county,
          addressCountry: 'GB',
        },
      },
      articleSection: 'Weather',
      inLanguage: 'en-GB',
    };

    const existing = document.querySelector('script[data-structured-data="weather-article"]');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'weather-article');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [locationName, county, countySlug, slug, headline, todaySummary]);

  return null;
}

export function HowToStructuredData() {
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to know if you need an umbrella today',
      description: 'A simple guide to checking if you need to bring your brolly when heading out in the UK.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Search for your location',
          text: 'Enter your town or village name in the search box to find your local weather forecast.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Check the headline',
          text: 'Look at the plain English summary at the top of the page - it will tell you if rain is expected and when.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Review the hourly forecast',
          text: 'Check the hour-by-hour breakdown to see exactly when rain is likely and plan your outdoor activities accordingly.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Decide on your brolly',
          text: 'If rain is expected during your time outside, take your umbrella. If not, leave it at home!',
        },
      ],
      totalTime: 'PT1M',
    };

    const existing = document.querySelector('script[data-structured-data="howto"]');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', 'howto');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
