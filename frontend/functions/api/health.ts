import { jsonResponse } from '../_shared/response';

export const onRequestGet: PagesFunction = async () => {
  return jsonResponse({ status: 'ok' });
};
