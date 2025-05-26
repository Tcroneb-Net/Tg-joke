import fetch from 'node-fetch';

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

export default async function handler(req, res) {
  try {
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?format=txt');
    const joke = await response.text();

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: `TCRONEB HACKX:\n\n${joke}`,
      }),
    });

    res.status(200).json({ message: 'Joke sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send joke' });
  }
}
