const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const botToken = process.env.BOT_TOKEN; // or hardcode it if needed
  const chatId = process.env.CHAT_ID;     // or hardcode it

  if (!botToken || !chatId) {
    return res.status(400).json({ error: "Missing BOT_TOKEN or CHAT_ID" });
  }

  try {
    // Get meme list
    const memeRes = await fetch("https://api.imgflip.com/get_memes");
    const memeData = await memeRes.json();

    if (!memeData.success || !memeData.data || !memeData.data.memes.length) {
      return res.status(500).json({ error: "Failed to fetch memes" });
    }

    // Pick random meme
    const memes = memeData.data.memes;
    const meme = memes[Math.floor(Math.random() * memes.length)];

    // Send meme via Telegram
    const sendUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

    const telegramRes = await fetch(sendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: meme.url,
        caption: `*${meme.name}*`,
        parse_mode: "Markdown"
      })
    });

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      return res.status(500).json({ error: "Failed to send meme to Telegram", telegramData });
    }

    return res.json({ success: true, meme: meme.name, url: meme.url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
