const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const botToken = process.env.BOT_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(400).json({ error: "Missing BOT_TOKEN or CHAT_ID" });
  }

  try {
    const jokeRes = await fetch("https://api.imgflip.com/get_memes");
    const jokeData = await jokeRes.json();

    if (!jokeData || !jokeData.joke) {
      return res.status(500).json({ error: "No joke received" });
    }

    const message = `💬 *JOKE TIME*\n\n${jokeData.joke}\n\n_Made by TCRONEB HACKX_`;

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      })
    });

    const telegramData = await telegramRes.json();

    if (!telegramData.ok) {
      return res.status(500).json({ error: "Failed to send joke", telegramData });
    }

    return res.json({ success: true, joke: jokeData.joke });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
