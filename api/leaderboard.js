import { readBoard } from '../server/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method' });
    return;
  }
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    res.status(200).json({ scores: await readBoard(url.searchParams.get('challenge')) });
  } catch (error) {
    console.error('leaderboard', error.status || error.code || 'error');
    res.status(error.status || 500).json({ error: error.status ? error.message : 'unavailable' });
  }
}
