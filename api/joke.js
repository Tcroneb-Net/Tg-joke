import fetch from "node-fetch";
import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);

export default async function handler(req, res) {
  const chatId = req.query.chat_id || "@tbadibwoytech";
  if (!chatId) return res.status(400).json({ error: "chat_id is required" });

  try {
    // 1. Get trending movies
    const ytsRes = await fetch("https://yts.mx/api/v2/list_movies.json?limit=20&sort_by=year");
    const ytsData = await ytsRes.json();
    const movies = ytsData.data.movies || [];
    if (!movies.length) throw new Error("No movies found");

    // 2. Pick random movie
    const movie = movies[Math.floor(Math.random() * movies.length)];
    if (!movie.yt_trailer_code) throw new Error("No trailer available");

    const ytUrl = `https://www.youtube.com/watch?v=${movie.yt_trailer_code}`;

    // 3. Download trailer as mp4 (first available 480p)
    const { stdout } = await execPromise(
      `yt-dlp -f 'best[ext=mp4][height<=480]' -g ${ytUrl}`
    );
    const directVideoUrl = stdout.trim();

    // 4. Send video to Telegram
    const caption = `🎬 *${movie.title}* (${movie.year})\n⭐ ${movie.rating}/10`;
    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendVideo`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          video: directVideoUrl,
          caption,
          parse_mode: "Markdown",
          supports_streaming: true
        })
      }
    );

    const tgData = await tgRes.json();
    if (!tgData.ok) throw new Error("Telegram video send failed");

    res.status(200).json({
      ok: true,
      movie: movie.title,
      trailer: directVideoUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
