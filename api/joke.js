const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: "Missing BOT_TOKEN or CHAT_ID" });
  }

  try {
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?format=txt');
    const joke = await response.text();

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: `TCRONEB HACKX:\n\n${joke}`
      })
    });

    res.status(200).json({ message: 'Joke sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending joke' });
  }
};
