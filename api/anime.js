import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '7080079152'; // fallback for your own ID
  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    // 1. Fetch anime image
    const imgRes = await fetch('https://nekos.best/api/v2/neko');
    const imgData = await imgRes.json();
    const imageUrl = imgData.results[0].url;

    // 2. Fetch a quote (example using JokeAPI for a quote-like message)
    const quoteRes = await fetch('https://v2.jokeapi.dev/joke/Any?type=single');
    const quoteData = await quoteRes.json();
    const quote = quoteData.joke || "Here is an anime quote!";

    // 3. Send photo with caption
    const sendPhotoRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: `${quote}\n\n_Created by_ \`TCRONEB HACKX\``,
        parse_mode: 'Markdown'
      })
    });

    const photoData = await sendPhotoRes.json();
    if (!photoData.ok) {
      return res.status(500).json({ error: 'Failed to send photo', details: photoData });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
