import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '7080079152'; // fallback for your own ID

  if (!chatId) {
    return res.status(400).json({ error: 'chat_id is required' });
  }

  try {
    const imageRes = await fetch('https://nekos.best/api/v2/neko');
    const imageData = await imageRes.json();
    const imageUrl = imageData.results[0].url;

    const caption = `✨ *ANIME QUOTE*\n\n_Created by_ \`TCRONEB HACKX\``;

    const sendRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: caption,
        parse_mode: 'Markdown'
      })
    });

    const data = await sendRes.json();
    if (!data.ok) {
      return res.status(500).json({ error: 'Failed to send', telegram: data });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
