// File: /api/meme.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '@deployed_bots'; // fallback to your channel

  if (!chatId) {
    return res.status(400).json({ error: 'chat_id is required' });
  }

  try {
    // Fetch meme image
    const memeRes = await fetch('https://api.imgflip.com/get_memes');
    const memeData = await memeRes.json();
    const memes = memeData.data.memes;
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];

    // Send meme to Telegram
    const sendRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: randomMeme.url,
        caption: `*${randomMeme.name}*\n\n_Created by_ \`TCRONEB HACKX\``,
        parse_mode: 'Markdown'
      })
    });

    const result = await sendRes.json();

    if (!result.ok) {
      return res.status(500).json({ error: 'Failed to send meme', details: result });
    }

    res.status(200).json({ ok: true, meme: randomMeme.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
