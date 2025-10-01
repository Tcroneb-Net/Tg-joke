import fetch from "node-fetch";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;
const API_SEARCH = "https://ab-yts.abrahamdw882.workers.dev?query=";
const API_FORMATS = "https://ab-ytdlprov2.abrahamdw882.workers.dev/?url=";

// Categories to fetch randomly
const CATEGORIES = [
  "action movie trailer",
  "music video",
  "anime clip",
  "funny short",
  "viral video"
];

// Helper: pick random item
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export default async function handler(req, res) {
  const chatId = req.query.chat_id || "@tbadibwoytech";
  if (!chatId) return res.status(400).json({ error: "chat_id is required" });

  try {
    const category = pickRandom(CATEGORIES);

    // 1️⃣ Search random video
    const searchRes = await fetch(API_SEARCH + encodeURIComponent(category), { referrerPolicy: "no-referrer" });
    const videos = await searchRes.json();
    if (!videos || videos.length === 0) return res.status(404).json({ error: "No videos found" });

    const video = pickRandom(videos); // Pick a random video
    if (!video.url) return res.status(404).json({ error: "Video missing URL" });

    // 2️⃣ Fetch video formats
    const formatRes = await fetch(API_FORMATS + encodeURIComponent(video.url), { referrerPolicy: "no-referrer" });
    const formats = await formatRes.json();
    if (!formats?.video?.length) return res.status(404).json({ error: "No video format found" });

    const mp4Url = formats.video[0].download;
    if (!mp4Url) return res.status(404).json({ error: "No mp4 video available" });

    // 3️⃣ Send video with Telegram
    const now = new Date();
    const caption = `
🎬 *${video.title}*  
🕒 ${now.toLocaleString()}  
Category: ${category}  

Enjoy this random video! 🚀
`;

    const videoRes = await fetch(`${TELEGRAM_API}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        video: mp4Url,
        caption,
        parse_mode: "Markdown",
        supports_streaming: true
      })
    });
    const videoData = await videoRes.json();
    if (!videoData.ok) throw new Error("Failed sending video");

    // 4️⃣ Create poll for feedback
    await fetch(`${TELEGRAM_API}/sendPoll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        question: "How do you rate this video?",
        options: JSON.stringify(["🔥 Amazing", "😐 Okay", "🙁 Not good"]),
        is_anonymous: false,
        reply_to_message_id: videoData.result.message_id
      })
    });

    res.status(200).json({
      ok: true,
      category,
      title: video.title,
      video: mp4Url,
      message: "✅ Video sent successfully!"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
