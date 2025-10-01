import fetch from "node-fetch";

export default async function handler(req, res) {
  const chatId = req.query.chat_id || "@tbadibwoytech"; // replace with your channel/group/bot
  if (!chatId) return res.status(400).json({ error: "chat_id is required" });

  try {
    // 1. Fetch trending movies from YTS
    const ytsRes = await fetch("https://yts.mx/api/v2/list_movies.json?limit=20&sort_by=year");
    const ytsData = await ytsRes.json();
    const movies = ytsData.data.movies || [];
    if (!movies.length) throw new Error("No movies found");

    // 2. Pick a random movie
    const movie = movies[Math.floor(Math.random() * movies.length)];
    const youtubeUrl = movie.yt_trailer_code
      ? `https://www.youtube.com/watch?v=${movie.yt_trailer_code}`
      : null;

    // 3. Caption
    const caption = `
🎬 *${movie.title}* (${movie.year})
⭐ ${movie.rating}/10
📀 Genre: ${movie.genres?.join(", ") || "Unknown"}

🎥 Trailer: ${youtubeUrl || "Not available"}

_Powered by YTS & MonitorPro Bot_
`;

    // 4. Inline voting buttons
    const keyboard = {
      inline_keyboard: [
        [
          { text: "👍 Awesome", callback_data: "vote_up" },
          { text: "😐 Meh", callback_data: "vote_neutral" },
          { text: "👎 Bad", callback_data: "vote_down" }
        ]
      ]
    };

    // 5. Send movie poster with buttons
    const sendPhotoRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: movie.medium_cover_image,
          caption,
          parse_mode: "Markdown",
          reply_markup: keyboard
        })
      }
    );

    const photoData = await sendPhotoRes.json();
    if (!photoData.ok) throw new Error("Failed to send movie");

    res.status(200).json({
      ok: true,
      movie: movie.title,
      trailer: youtubeUrl || "N/A"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
