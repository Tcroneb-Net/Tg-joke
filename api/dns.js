import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { hostname } = req.query;
  if (!hostname) return res.status(400).json({ error: 'Missing hostname' });

  try {
    const apiUrl = `https://networkcalc.com/api/dns/lookup/${hostname}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data || data.error) {
      return res.status(500).json({ error: 'Failed to fetch DNS info', details: data.error || data });
    }

    res.status(200).json({ ok: true, hostname, dns: data.records });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
