const fetch = require('node-fetch');

function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, '\\$1');
}

function getRandomSigh() {
  const sighs = [
    "*Sigh... Anime feels...*",
    "*Only anime understands me*",
    "*Just another anime day*",
    "*These quotes hit deep*",
    "*Emotional damage...*",
    "*Powered by anime energy*"
  ];
  return sighs[Math.floor(Math.random() * sighs.length)];
}

module.exports = async (req, res) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;
  const CHANNEL_ID = process.env.CHANNEL_ID;

  if (!BOT_TOKEN || !CHAT_ID || !CHANNEL_ID) {
    return res.status(500).json({ error: "Missing env variables" });
  }

  try {
    // Anime quote
    const quoteRes = await fetch('https://animechan.xyz/api/random');
    const quoteData = await quoteRes.json();
    const quote = escapeMarkdownV2(`${quoteData.quote} — ${quoteData.character} (${quoteData.anime})`);

    // Anime image
    const animeRes = await fetch('https://nekos.best/api/v2/neko');
    const animeData = await animeRes.json();
    const animeImage = animeData.results[0].url;

    // Final message
    const message = `\`TCRONEB HACKX\`

> ${quote}

${getRandomSigh()}`;

    const send = async (chatId) => {
      const telegramRes = await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendPhoto\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: animeImage,
          caption: message,
          parse_mode: 'MarkdownV2'
        })
      });
      const data = await telegramRes.json();
      if (!data.ok) throw new Error(JSON.stringify(data));
    };

    await send(CHAT_ID);
    await send(CHANNEL_ID);

    res.status(200).json({ success: true, message: 'Sent!' });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: 'Send failed', details: err.message });
  }
};
