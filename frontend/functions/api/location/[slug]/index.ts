import { jsonResponse, errorResponse } from '../../../_shared/response';
import { locationsBySlug } from '../../../_shared/ukLocations';

// Cache location lookups for 24 hours (static data)
const EDGE_CACHE_TTL = 24 * 60 * 60;

export const onRequestGet: PagesFunction<unknown, 'slug'> = async (context) => {
  const slug = context.params.slug as string;
  const location = locationsBySlug.get(slug);

  if (!location) {
    return errorResponse('Location not found', 404);
  }

  return jsonResponse(location, 200, EDGE_CACHE_TTL);
};
