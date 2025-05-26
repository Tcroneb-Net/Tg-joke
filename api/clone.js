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
    // 1. Send cloned confirmation message
    let response = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user_id,
        text: '🤖 Your bot has been successfully cloned! Welcome to TCRONEB HACKX.',
      }),
    });
    let data = await response.json();
    if (!data.ok) return res.status(400).json({ error: `Telegram error: ${data.description}` });

    // 2. Fetch a joke from JokeAPI
    const jokeRes = await fetch('https://v2.jokeapi.dev/joke/Any');
    const jokeData = await jokeRes.json();

    let jokeText = '';
    if (jokeData.type === 'single') {
      jokeText = jokeData.joke;
    } else {
      jokeText = `${jokeData.setup}\n${jokeData.delivery}`;
    }

    // Send joke message
    response = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user_id,
        text: `😂 Joke Time!\n\n${jokeText}`,
      }),
    });
    data = await response.json();
    if (!data.ok) return res.status(400).json({ error: `Telegram error: ${data.description}` });

    // 3. Fetch anime image from Nekos.best
    const animeRes = await fetch('https://nekos.best/api/v2/neko');
    const animeData = await animeRes.json();
    const imageUrl = animeData.results[0].url;

    const caption = `ANIME QUOTE\nBy TCRONEB HACKX`;

    // Send anime photo with caption
    response = await fetch(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user_id,
        photo: imageUrl,
        caption: caption,
      }),
    });
    data = await response.json();
    if (!data.ok) return res.status(400).json({ error: `Telegram error: ${data.description}` });

    // All done!
    res.status(200).json({ success: true, message: 'Cloned, joke, and anime sent successfully.' });

  } catch (err) {
    console.error('Error in clone handler:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
