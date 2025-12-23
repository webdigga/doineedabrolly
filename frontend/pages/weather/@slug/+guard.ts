import type { GuardSync } from 'vike/types';
import { redirect } from 'vike/abort';
import { locationsBySlug } from '../../../functions/_shared/ukLocations';

// Redirect legacy /weather/:slug URLs to /weather/:countySlug/:slug
export const guard: GuardSync = (pageContext) => {
  const { slug } = pageContext.routeParams;
  const location = locationsBySlug.get(slug);

  if (location) {
    // Redirect to the correct URL with county
    throw redirect(`/weather/${location.countySlug}/${location.slug}`, 301);
  }

  // Location not found - redirect to home
  throw redirect('/', 302);
};
