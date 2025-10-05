import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { Vote } from '../models/vote.js';

const MONGO_URI = process.env.MONGO_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;

// Connect MongoDB (cached in serverless)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// --- Premium categories ---
const categories = [
  'Anime 4K', 'Action Actors', 'Cute Girl', 'Fantasy Art', 'Digital Art',
  'Kawaii', 'Manga Art', 'Trader', 'Fight', 'Race Car', 'Galaxy', 'Space',
  'Motivation', 'Luxury', 'Sports', 'Cars', 'Technology', 'Gaming'
];

// --- Helper: fetch random image ---
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

// --- Helper: fetch a programming joke ---
async function getJoke() {
  try {
    const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    const data = await res.json();
    return data?.[0] ? `${data[0].setup} - ${data[0].punchline}` : "Here's a joke!";
  } catch {
    return "Here's a joke!";
  }
}

// --- Send message to Telegram chat ---
async function sendContent(chatId) {
  const { image, category } = await getRandomImage();
  if (!image) return;

  const joke = await getJoke();
  const caption = `🎯 Category: *${category}*\n\n💡 Joke: "${joke}"\n\nVote below if you like this!`;

  // Send photo
  const sendPhoto = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
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
  const photoData = await sendPhoto.json();
  if (!photoData.ok) return;

  // Create poll for voting
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPoll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      question: "Do you like this image?",
      options: JSON.stringify(["😍 Love it", "😐 Meh", "🙁 Not for me"]),
      is_anonymous: false,
      type: "regular",
      allows_multiple_answers: false,
      reply_to_message_id: photoData.result.message_id,
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
}

// --- Vercel function handler ---
export default async function handler(req, res) {
  await connectToDB();

  const chatId = req.query.chat_id; // optional: specify channel/group
  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    await sendContent(chatId);
    res.status(200).json({ ok: true, message: 'Content sent!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
