import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' });

  const { hostname } = req.query;
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!hostname)
    return res.status(400).json({ error: 'hostname query param is required' });
  if (!BOT_TOKEN || !CHAT_ID)
    return res
      .status(500)
      .json({ error: 'Missing BOT_TOKEN or CHAT_ID environment variables' });

  try {
    const dnsRes = await fetch(`https://networkcalc.com/api/dns/lookup/${hostname}`);

    if (!dnsRes.ok)
      throw new Error(`Failed to fetch DNS data: ${dnsRes.status}`);

    const dnsData = await dnsRes.json();

    // Collect A records or fallback
    const records = dnsData.records?.A;
    let messageText;

    if (records && records.length > 0) {
      const ips = records.map((r) => r.address).join('\n');
      messageText = `*DNS Lookup for:* \`${hostname}\`\n\n*IP Addresses:*\n${ips}`;
    } else {
      messageText = `*DNS Lookup for:* \`${hostname}\`\n\n_No A records found._`;
    }

    // Send message to Telegram
    const sendRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: messageText,
          parse_mode: 'Markdown',
        }),
      }
    );

    const sendJson = await sendRes.json();

    if (!sendJson.ok)
      return res.status(500).json({
        error: 'Failed to send message to Telegram',
        details: sendJson,
      });

    res.status(200).json({ success: true, message: 'DNS info sent to Telegram' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
