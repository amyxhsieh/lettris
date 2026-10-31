import { HttpError } from './boards.js';
import { readBoard, readStats, recordRun } from './store.js';

export async function dispatch(method, pathname, params, rawBody) {
  try {
    if (method === 'GET' && pathname === '/api/stats') {
      return { status: 200, body: await readStats() };
    }
    if (method === 'GET' && pathname === '/api/leaderboard') {
      const scores = await readBoard(params.get('challenge'));
      return { status: 200, body: { scores } };
    }
    if (method === 'POST' && pathname === '/api/runs') {
      let body = {};
      if (rawBody) {
        try {
          body = JSON.parse(rawBody);
        } catch {
          throw new HttpError(400, 'invalid json');
        }
      }
      return { status: 200, body: await recordRun(body) };
    }
    return { status: 404, body: { error: 'not found' } };
  } catch (error) {
    const status = error.status || 500;
    return { status, body: { error: status === 500 ? 'unavailable' : error.message } };
  }
}
