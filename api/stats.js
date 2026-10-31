import { readStats } from '../server/store.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method' });
    return;
  }
  try {
    res.status(200).json(await readStats());
  } catch (error) {
    console.error('stats', error.status || error.code || 'error');
    res.status(error.status || 500).json({ error: error.status ? error.message : 'unavailable' });
  }
}
