import fetch from "node-fetch";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";
import FormData from "form-data";

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
    if (!movie.yt_trailer_code) throw new Error("No trailer available for this movie");

    const youtubeUrl = `https://www.youtube.com/watch?v=${movie.yt_trailer_code}`;
    const filePath = path.resolve(`./${movie.yt_trailer_code}.mp4`);

    // 3. Download trailer (lowest quality to avoid Telegram size limits)
    const videoStream = ytdl(youtubeUrl, { quality: "lowest" });
    const writeStream = fs.createWriteStream(filePath);
    videoStream.pipe(writeStream);

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // 4. Upload trailer to Telegram
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("video", fs.createReadStream(filePath));
    formData.append(
      "caption",
      `🎬 *${movie.title}* (${movie.year})\n⭐ ${movie.rating}/10\n📀 Genre: ${movie.genres?.join(", ") || "Unknown"}\n\nTrailer from YTS`
    );
    formData.append("parse_mode", "Markdown");

    const sendVideoRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendVideo`, {
      method: "POST",
      body: formData
    });

    const videoData = await sendVideoRes.json();
    if (!videoData.ok) throw new Error("Failed to send trailer video");

    // 5. Clean up
    fs.unlinkSync(filePath);

    res.status(200).json({ ok: true, movie: movie.title, youtube: youtubeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
