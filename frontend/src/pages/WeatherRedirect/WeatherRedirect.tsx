import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from '../../hooks/useLocation';

/**
 * Redirects old /weather/:slug URLs to new /weather/:countySlug/:slug format
 */
export function WeatherRedirect() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { location, isLoading, notFound } = useLocation(slug);

  useEffect(() => {
    if (isLoading) return;

    if (notFound || !location) {
      // Location not found, redirect to home
      navigate('/', { replace: true });
      return;
    }

    // Redirect to the correct URL with county
    const newUrl = `/weather/${location.countySlug}/${location.slug}`;
    navigate(newUrl, { replace: true });
  }, [location, isLoading, notFound, navigate]);

  // Show nothing while redirecting
  return null;
}
