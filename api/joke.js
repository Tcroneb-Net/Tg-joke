const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;         // Your personal chat
  const CHANNEL_ID = process.env.CHANNEL_ID;   // Your channel username or ID

  if (!BOT_TOKEN || !CHAT_ID || !CHANNEL_ID) {
    return res.status(500).json({ error: "Missing BOT_TOKEN, CHAT_ID or CHANNEL_ID" });
  }

  try {
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?format=txt');
    const joke = await response.text();

    const message = `\`TCRONEB HACKX\`\n\n> ${joke.replace(/([*_`()])/g, '\\$1')}`;

    const sendMessage = async (chatId) => {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'MarkdownV2'
        })
      });
    };

    await sendMessage(CHAT_ID);
    await sendMessage(CHANNEL_ID);

    res.status(200).json({ message: 'Joke sent to chat and channel!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending joke' });
  }
};
