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
