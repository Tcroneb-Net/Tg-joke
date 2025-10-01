import fetch from "node-fetch";

export default async function handler(req, res) {
  const chatId = req.query.chat_id || "@tbadibwoytech";
  if (!chatId) return res.status(400).json({ error: "chat_id is required" });

  try {
    // 1. Get trending movies from YTS
    const ytsRes = await fetch("https://yts.mx/api/v2/list_movies.json?limit=20&sort_by=year");
    const ytsData = await ytsRes.json();
    const movies = ytsData.data.movies || [];
    if (!movies.length) throw new Error("No movies found");

    // 2. Pick a random movie
    const movie = movies[Math.floor(Math.random() * movies.length)];
    if (!movie.yt_trailer_code) throw new Error("No trailer available");

    const ytUrl = `https://www.youtube.com/watch?v=${movie.yt_trailer_code}`;

    // 3. Get direct MP4 link using serverless-friendly API
    const apiRes = await fetch(`https://api.youtubedownloadapi.com/get?url=${ytUrl}&format=mp4`);
    const apiData = await apiRes.json();
    if (!apiData?.url) throw new Error("Could not fetch direct video URL");

    const videoUrl = apiData.url;

    // 4. Send video to Telegram
    const caption = `🎬 *${movie.title}* (${movie.year})\n⭐ Rating: ${movie.rating}/10\n💡 Enjoy the trailer!`;
    const tgRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        video: videoUrl,
        caption,
        parse_mode: "Markdown",
        supports_streaming: true
      })
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) throw new Error("Failed to send video to Telegram");

    res.status(200).json({
      ok: true,
      movie: movie.title,
      trailer: videoUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
