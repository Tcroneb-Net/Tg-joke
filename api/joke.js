import fetch from "node-fetch";

export default async function handler(req, res) {
  const chatId = req.query.chat_id || "@tbadibwoytech";
  if (!chatId) return res.status(400).json({ error: "chat_id is required" });

  try {
    // Fetch trending movies from YTS
    const ytsRes = await fetch("https://yts.mx/api/v2/list_movies.json?limit=20&sort_by=year");
    const ytsData = await ytsRes.json();
    let movies = ytsData.data.movies || [];

    // Filter only movies that have a trailer
    movies = movies.filter(m => m.yt_trailer_code);
    if (!movies.length) throw new Error("No movies with trailers available");

    // Pick a random movie
    const movie = movies[Math.floor(Math.random() * movies.length)];
    const ytUrl = `https://www.youtube.com/watch?v=${movie.yt_trailer_code}`;

    // Use a YouTube download API to get direct MP4 link
    const apiRes = await fetch(`https://api.youtubedownloadapi.com/get?url=${ytUrl}&format=mp4`);
    const apiData = await apiRes.json();
    if (!apiData?.url) throw new Error("Could not fetch direct video URL");

    const videoUrl = apiData.url;

    // Send video to Telegram
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

    // Optional: Create poll
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPoll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        question: "Did you like this trailer?",
        options: JSON.stringify(["😍 Loved it", "😐 It's okay", "🙁 Not my type"]),
        is_anonymous: false,
        reply_to_message_id: tgData.result.message_id
      })
    });

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
