import fetch from 'node-fetch';

const CHANNEL_ID = '@deployed_bots'; // or '-1001234567890'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { bot_token, user_id } = req.body;

  if (!bot_token || !user_id) {
    return res.status(400).json({ error: 'bot_token and user_id are required' });
  }

  async function sendTelegramMessage(chat_id, text) {
    const url = `https://api.telegram.org/bot${bot_token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text }),
    });
    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Failed to send to ${chat_id}: ${data.description}`);
    }
    return data;
  }

  try {
    // Fetch joke
    const jokeRes = await fetch('https://v2.jokeapi.dev/joke/Any');
    const jokeData = await jokeRes.json();

    let jokeText = '';
    if (jokeData.type === 'single') {
      jokeText = jokeData.joke;
    } else if (jokeData.type === 'twopart') {
      jokeText = `${jokeData.setup}\n${jokeData.delivery}`;
    } else {
      jokeText = 'No joke available';
    }

    // Send to user
    await sendTelegramMessage(user_id, `Here's a joke for you:\n\n${jokeText}`);

    // Send to channel
    await sendTelegramMessage(CHANNEL_ID, `Joke from cloned bot:\n\n${jokeText}`);

    res.status(200).json({ success: true, message: 'Joke sent to user and channel' });
  } catch (error) {
    console.error('Error sending joke:', error);
    res.status(500).json({ error: error.message });
  }
}
