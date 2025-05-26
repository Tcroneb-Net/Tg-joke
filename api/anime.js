import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '@deployed_bots' , '@randompaidBot'; // fallback for your own ID
  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    // Fetch anime image
    const imgRes = await fetch('https://nekos.best/api/v2/neko');
    const imgData = await imgRes.json();
    const imageUrl = imgData.results[0].url;

    // Fetch first quote for caption
    const quoteRes1 = await fetch('https://v2.jokeapi.dev/joke/Any?type=single');
    const quoteData1 = await quoteRes1.json();
    const quote1 = quoteData1.joke || "Here is an anime quote!";

    // Fetch second quote for reply
    const quoteRes2 = await fetch('https://v2.jokeapi.dev/joke/Any?type=single');
    const quoteData2 = await quoteRes2.json();
    const quote2 = quoteData2.joke || "Another anime quote!";

    // Send photo with caption
    const sendPhotoRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: `${quote1}\n\n_Created by_ \`TCRONEB HACKX\``,
        parse_mode: 'Markdown'
      })
    });

    const photoData = await sendPhotoRes.json();
    if (!photoData.ok) {
      return res.status(500).json({ error: 'Failed to send photo', details: photoData });
    }

    // Auto-reply with second quote to the sent photo message
    const replyRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: quote2,
        reply_to_message_id: photoData.result.message_id
      })
    });

    const replyData = await replyRes.json();
    if (!replyData.ok) {
      return res.status(500).json({ error: 'Failed to send reply', details: replyData });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
