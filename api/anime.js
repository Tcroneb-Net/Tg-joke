import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { Vote } from '../models/vote.js';

const TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;

// Connect MongoDB
let conn = null;
async function connectDB() {
  if (conn) return conn;
  conn = await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  return conn;
}

// Categories
const categories = [
  'Anime 4K', 'Action Actors', 'Cute Girl', 'Fantasy Art', 'Digital Art',
  'Code', 'Manga Art', 'Trader', 'Fight', 'Race Car', 'Galaxy', 'Space',
  'Motivation', 'Luxury', 'Sports', 'Cars', 'Technology', 'Gaming'
];

// Fetch random image
async function getRandomImage() {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const apiUrl = `https://ab-pinetrest.abrahamdw882.workers.dev/?query=${encodeURIComponent(category)}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const pins = data.data || [];
    if (!pins.length) return { image: null, category };
    const randomPin = pins[Math.floor(Math.random() * pins.length)];
    return { image: randomPin.image, category };
  } catch {
    return { image: null, category };
  }
}

// Fetch joke
async function getJoke() {
  try {
    const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    const data = await res.json();
    return data?.[0] ? `${data[0].setup} - ${data[0].punchline}` : "Here's a joke!";
  } catch {
    return "Here's a joke!";
  }
}

export default async function handler(req, res) {
  await connectDB();
  const chatId = req.query.chat_id || process.env.DEFAULT_CHAT_ID;
  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  const { image, category } = await getRandomImage();
  if (!image) return res.status(200).json({ ok: false, message: 'No image found' });

  const joke = await getJoke();
  const caption = `🎯 Category: *${category}*\n\n💡 Joke: "${joke}"`;

  try {
    // Send photo
    const photoRes = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: image,
        caption,
        parse_mode: 'Markdown',
        disable_notification: true
      })
    });
    const photoData = await photoRes.json();
    if (!photoData.ok) return res.status(500).json({ ok: false, message: 'Failed to send photo' });

    // Send inline vote buttons
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "😍 Love it", callback_data: `vote|${photoData.result.message_id}|Love` },
          { text: "😐 Meh", callback_data: `vote|${photoData.result.message_id}|Meh` },
          { text: "🙁 Not for me", callback_data: `vote|${photoData.result.message_id}|Not` }
        ]
      ]
    };
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "Cast your vote:",
        reply_markup: inlineKeyboard,
        disable_notification: true
      })
    });

    // Save to MongoDB
    await Vote.create({
      messageId: photoData.result.message_id,
      chatId,
      image,
      category
    });

    res.status(200).json({ ok: true, image, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
