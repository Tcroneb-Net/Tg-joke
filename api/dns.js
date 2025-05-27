import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { message } = req.body;
  const botToken = process.env.BOT_TOKEN;

  if (!botToken) return res.status(500).json({ error: 'Missing BOT_TOKEN' });

  const chatId = message?.chat?.id;
  const text = message?.text;

  // Start command to show button
  if (text === '/dns') {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: 'Click the button to lookup DNS for a domain.',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'DNS Lookup', callback_data: 'lookup_dns' }]
          ]
        }
      })
    });
    return res.status(200).json({ ok: true });
  }

  // Handle domain input like "example.com"
  if (text?.match(/^[a-zA-Z0-9.-]+\.[a-z]{2,}$/)) {
    const domain = text.trim();

    try {
      const dnsRes = await fetch(`https://networkcalc.com/api/dns/lookup/${domain}`);
      const dnsJson = await dnsRes.json();

      const records = dnsJson.records;
      const responseText = `*DNS Lookup for:* \`${domain}\`\n\n` + records.map(r => 
        `*${r.type}* → \`${r.value}\``).join('\n');

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          parse_mode: 'Markdown'
        })
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'DNS fetch failed', details: err.message });
    }
  }

  res.status(200).json({ ok: true });
}
