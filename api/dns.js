import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { hostname } = req.query;
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID || '@deployed_bots';

  if (!hostname) return res.status(400).json({ error: 'hostname query param is required' });
  if (!BOT_TOKEN) return res.status(500).json({ error: 'Bot token not set in environment' });

  try {
    const dnsRes = await fetch(`https://networkcalc.com/api/dns/lookup/${hostname}`);
    if (!dnsRes.ok) throw new Error(`Failed to fetch DNS data: ${dnsRes.status}`);

    const dnsData = await dnsRes.json();

    const records = dnsData.records?.A;
    let result = records
      ? records.map((a) => `IP: ${a.address}`).join('\n')
      : 'No A records found.';

    const message = `*DNS Lookup Result for:* \`${hostname}\`\n\n${result}`;

    const sendRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const sendJson = await sendRes.json();
    if (!sendJson.ok) {
      return res.status(500).json({ error: 'Failed to send message', details: sendJson });
    }

    return res.status(200).json({ success: true, message: 'DNS info sent to Telegram.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
