import fetch from 'node-fetch';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID || '@tbadibwoytech'; // or set user ID directly

const hostnames = [
  { domain: 'econet.com', delay: 0 },
  { domain: 'netone.com', delay: 60 * 1000 }, // after 1 minute
  { domain: 'ecocash.com', delay: 120 * 1000 } // after 2 minutes
];

async function fetchAndSendDNS(domain) {
  try {
    const dnsRes = await fetch(`https://networkcalc.com/api/dns/lookup/${domain}`);
    const dnsData = await dnsRes.json();

    const result = dnsData.records?.A?.map(a => `IP: ${a.address}`).join('\n') || "No A records found.";
    const message = `*DNS Lookup Result for:* \`${domain}\`\n\n${result}`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    return { success: true, domain };
  } catch (err) {
    return { success: false, domain, error: err.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  hostnames.forEach(({ domain, delay }) => {
    setTimeout(() => {
      fetchAndSendDNS(domain);
    }, delay);
  });

  res.status(200).json({ message: 'DNS lookups scheduled.' });
}
