import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bot_token, user_id } = req.body;

  if (!bot_token || !user_id) {
    return res.status(400).json({ error: 'Missing bot_token or user_id' });
  }

  try {
    const message = `🤖 Your bot has been successfully cloned!\n\nYou can now use it just like TCRONEB HACKX.`;

    const telegramRes = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user_id,
        text: message
      }),
    });

    const result = await telegramRes.json();

    if (!result.ok) {
      return res.status(400).json({ error: result.description });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Clone error:', err);
    return res.status(500).json({ error: 'Clone failed internally' });
  }
}
