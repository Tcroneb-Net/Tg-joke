import fetch from 'node-fetch';

const users = [
  {
    token: 'YOUR_BOT_TOKEN_HERE',
    chat_id: 'YOUR_CHAT_ID_HERE'
  }
  // Add more user objects if needed
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    for (const user of users) {
      const jokeRes = await fetch('https://v2.jokeapi.dev/joke/Any');
      const joke = await jokeRes.json();

      const message = joke.type === 'single'
        ? joke.joke
        : `${joke.setup}\n${joke.delivery}`;

      await fetch(`https://api.telegram.org/bot${user.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.chat_id,
          text: `*Joke Time!*\n\n${message}`,
          parse_mode: "Markdown"
        })
      });
    }

    res.status(200).json({ success: true, message: 'Jokes sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send jokes' });
  }
}
