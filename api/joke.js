const fetch = require('node-fetch');

function escapeMarkdownV2(text) {
  return text.replace(/([_*()~`>#+=|{}.!\\-])/g, '\\$1');
}

module.exports = async (req, res) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;
  const CHANNEL_ID = process.env.CHANNEL_ID;

  if (!BOT_TOKEN || !CHAT_ID || !CHANNEL_ID) {
    return res.status(500).json({ error: "Missing env variables" });
  }

  try {
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?format=txt');
    const jokeRaw = await response.text();
    const joke = escapeMarkdownV2(jokeRaw);

    const message = `\`TCRONEB HACKX\`\n\n> ${joke}`;

    const sendMessage = async (chatId) => {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'MarkdownV2'
        })
      });
      const data = await res.json();
      if (!data.ok) {
        throw new Error(JSON.stringify(data));
      }
    };

    await sendMessage(CHAT_ID);
    await sendMessage(CHANNEL_ID);

    res.status(200).json({ message: 'Joke sent to both!' });
  } catch (err) {
    console.error("Telegram Error:", err);
    res.status(500).json({ error: 'Telegram send failed', details: err.message });
  }
};
