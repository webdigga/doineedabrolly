const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function jsonResponse(data: unknown, status = 200, cacheTtl = 0): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...CORS_HEADERS,
  };

  // Add edge caching for successful responses
  if (status === 200 && cacheTtl > 0) {
    headers['Cache-Control'] = `public, max-age=${cacheTtl}, s-maxage=${cacheTtl}`;
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export function corsResponse(): Response {
  return new Response(null, { headers: CORS_HEADERS });
}
