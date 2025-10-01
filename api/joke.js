import fetch from 'node-fetch';

// Worker endpoints
const API_SEARCH = "https://ab-yts.abrahamdw882.workers.dev?query=";
const API_FORMATS = "https://ab-ytdlprov2.abrahamdw882.workers.dev/?url=";

// Telegram Bot
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

export default async function handler(req, res) {
  const chatId = req.query.chat_id || "@tbadibwoytech";
  if (!chatId) return res.status(400).json({ error: "chat_id is required" });

  try {
    // 1️⃣ Fetch top action trailers
    const searchRes = await fetch(API_SEARCH + encodeURIComponent("action movie trailer"), { referrerPolicy: "no-referrer" });
    const videos = await searchRes.json();
    if (!videos || videos.length === 0) return res.status(404).json({ error: "No trailers found" });

    // Keep track of sent trailers (to avoid duplicates)
    const sentTrailers = [];

    for (const v of videos.slice(0, 5)) {
      // 2️⃣ Get MP4 URL
      const formatRes = await fetch(API_FORMATS + encodeURIComponent(v.url), { referrerPolicy: "no-referrer" });
      const formats = await formatRes.json();
      if (!formats?.video?.length) continue;

      const mp4Url = formats.video[0].download;
      if (!mp4Url || sentTrailers.includes(v.title)) continue;

      // 3️⃣ Send video to Telegram
      const now = new Date();
      const caption = `🎬 *${v.title}*  
🕒 ${now.toLocaleString()}  
Enjoy this action trailer!`;

      await fetch(`${TELEGRAM_API}/sendVideo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          video: mp4Url,
          caption: caption,
          parse_mode: "Markdown",
          supports_streaming: true
        })
      });

      // 4️⃣ Send poll for feedback
      await fetch(`${TELEGRAM_API}/sendPoll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          question: "How do you rate this trailer?",
          options: JSON.stringify(["🔥 Amazing", "😐 Okay", "🙁 Not good"]),
          is_anonymous: false
        })
      });

      sentTrailers.push(v.title);
    }

    res.status(200).json({ ok: true, sent: sentTrailers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
