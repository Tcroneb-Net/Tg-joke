import fetch from 'node-fetch';

const CHANNEL_ID = '@yourchannelusername'; // or the numeric channel chat id like -1001234567890

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { bot_token, user_id } = req.body;
  if (!bot_token || !user_id) {
    return res.status(400).json({ error: 'Missing bot_token or user_id' });
  }

  try {
    // 1. Send welcome message to user
    let resp = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user_id,
        text: 'Welcome! Your bot is cloned and running.',
      }),
    });
    let data = await resp.json();
    if (!data.ok) throw new Error(`Telegram user message failed: ${data.description}`);

    // 2. Fetch a joke
    const jokeRes = await fetch('https://v2.jokeapi.dev/joke/Any');
    const jokeData = await jokeRes.json();

    let jokeText = '';
    if (jokeData.type === 'single') {
      jokeText = jokeData.joke;
    } else {
      jokeText = `${jokeData.setup}\n${jokeData.delivery}`;
    }

    // 3. Send joke to user chat
    resp = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user_id,
        text: `😂 Joke:\n${jokeText}`,
      }),
    });
    data = await resp.json();
    if (!data.ok) throw new Error(`Telegram user joke failed: ${data.description}`);

    // 4. Send joke to channel
    resp = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        text: `😂 Joke (from cloned bot):\n${jokeText}`,
      }),
    });
    data = await resp.json();
    if (!data.ok) throw new Error(`Telegram channel joke failed: ${data.description}`);

    // 5. Fetch anime image
    const animeRes = await fetch('https://nekos.best/api/v2/neko');
    const animeData = await animeRes.json();
    const animeImageUrl = animeData.results[0].url;

    // 6. Send anime photo to user
    resp = await fetch(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user_id,
        photo: animeImageUrl,
        caption: 'ANIME QUOTE by TCRONEB HACKX',
      }),
    });
    data = await resp.json();
    if (!data.ok) throw new Error(`Telegram user anime photo failed: ${data.description}`);

    // 7. Send anime photo to channel
    resp = await fetch(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHANNEL_ID,
        photo: animeImageUrl,
        caption: 'ANIME QUOTE by TCRONEB HACKX',
      }),
    });
    data = await resp.json();
    if (!data.ok) throw new Error(`Telegram channel anime photo failed: ${data.description}`);

    res.status(200).json({ success: true, message: 'Messages sent to user and channel!' });
  } catch (err) {
    console.error('Error sending messages:', err);
    res.status(500).json({ error: err.message });
  }
}
