import { jsonResponse, errorResponse } from '../../_shared/response';
import { ukLocations } from '../../_shared/ukLocations';
import type { SearchResponse } from '../../_shared/types';

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const query = url.searchParams.get('q')?.toLowerCase().trim() || '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10', 10), 50);

  if (!query) {
    return errorResponse('Query parameter "q" is required');
  }

  if (query.length < 2) {
    return errorResponse('Query must be at least 2 characters');
  }

  const results = ukLocations
    .filter(loc => loc.name.toLowerCase().startsWith(query))
    .slice(0, limit);

  const response: SearchResponse = {
    results,
    total: results.length,
  };

  return jsonResponse(response);
};
