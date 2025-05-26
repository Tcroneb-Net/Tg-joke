import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.CHAT_ID;

  if (!chatId) {
    return res.status(400).json({ error: 'chat_id is required' });
  }

  try {
    // Fetch anime image
    const imgRes = await fetch('https://nekos.best/api/v2/neko');
    const data = await imgRes.json();
    const imageUrl = data.results[0].url;

    const caption = `✨ *ANIME QUOTE*\n\n_Created by_ \`TCRONEB HACKX\``;

    // Send photo via Telegram
    const tgRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: caption,
        parse_mode: 'Markdown'
      })
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      console.error('Telegram error:', tgData);
      return res.status(500).json({ error: 'Telegram failed', details: tgData });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
}
