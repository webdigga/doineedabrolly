import { jsonResponse, errorResponse } from '../../../_shared/response';
import { locationsBySlug } from '../../../_shared/ukLocations';

export const onRequestGet: PagesFunction<unknown, 'slug'> = async (context) => {
  const slug = context.params.slug as string;
  const location = locationsBySlug.get(slug);

  if (!location) {
    return errorResponse('Location not found', 404);
  }

  return jsonResponse(location);
};
