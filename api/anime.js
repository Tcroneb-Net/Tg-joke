import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { Vote } from './models/vote.js';

const TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;

await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log('✅ MongoDB connected');

const bot = new TelegramBot(TOKEN, { polling: true });

// --- Categories ---
let categories = [
  'Anime 4K', 'Action Actors', 'Cute Girl', 'Fantasy Art', 'Digital Art',
  'Code', 'Manga Art', 'Trader', 'Fight', 'Race Car', 'Galaxy', 'Space',
  'Motivation', 'Luxury', 'Sports', 'Cars', 'Technology', 'Gaming'
];

const activeChats = new Set();

// --- Fetch random image ---
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

// --- Fetch joke ---
async function getJoke() {
  try {
    const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    const data = await res.json();
    return data?.[0] ? `${data[0].setup} - ${data[0].punchline}` : "Here's a joke!";
  } catch {
    return "Here's a joke!";
  }
}

// --- Send image + inline voting + save vote in MongoDB ---
async function sendRandomContent(chatId) {
  const { image, category } = await getRandomImage();
  if (!image) return;

  const joke = await getJoke();
  const caption = `🎯 Category: *${category}*\n\n💡 Joke: "${joke}"\n\nVote below!`;

  try {
    const photo = await bot.sendPhoto(chatId, image, {
      caption,
      parse_mode: 'Markdown',
      disable_notification: true
    });

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: "😍 Love it", callback_data: `vote|${photo.message_id}|Love` },
          { text: "😐 Meh", callback_data: `vote|${photo.message_id}|Meh` },
          { text: "🙁 Not for me", callback_data: `vote|${photo.message_id}|Not` }
        ]
      ]
    };

    await bot.sendMessage(chatId, "Cast your vote:", {
      reply_markup: inlineKeyboard,
      disable_notification: true
    });

    // Save to DB
    await Vote.create({
      messageId: photo.message_id,
      chatId,
      image,
      category
    });
  } catch (err) {
    console.error('Failed to send content:', err);
  }
}

// --- Handle votes ---
bot.on('callback_query', async (query) => {
  const [action, messageId, vote] = query.data.split('|');
  if (action === 'vote') {
    const voteRecord = await Vote.findOne({ messageId });
    if (voteRecord) {
      voteRecord.votes[vote] += 1;
      await voteRecord.save();
      bot.answerCallbackQuery(query.id, { text: `You voted: ${vote}` });
    }
  }
});

// --- Track when bot is added to chat ---
bot.on('my_chat_member', async (update) => {
  const chat = update.chat;
  const status = update.new_chat_member?.status;
  if (status === 'member' || status === 'administrator') {
    activeChats.add(chat.id);
    sendRandomContent(chat.id);
  }
});

// --- Manual commands ---
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🤖 Pro Ultra Bot Active! I post premium images + jokes every 1 minute with inline voting and stats.");
});

// --- Auto-post every 1 min ---
setInterval(() => {
  activeChats.forEach(chatId => sendRandomContent(chatId));
}, 60 * 1000);

// --- Weekly summary (example) ---
async function sendWeeklySummary(adminChatId) {
  const votes = await Vote.find({ timestamp: { $gte: new Date(Date.now() - 7*24*60*60*1000) } });
  const stats = {};

  votes.forEach(v => {
    if (!stats[v.category]) stats[v.category] = { Love: 0, Meh: 0, Not: 0 };
    stats[v.category].Love += v.votes.Love;
    stats[v.category].Meh += v.votes.Meh;
    stats[v.category].Not += v.votes.Not;
  });

  let summary = "📊 Weekly Stats:\n\n";
  for (const cat in stats) {
    summary += `*${cat}*: 😍 ${stats[cat].Love} | 😐 ${stats[cat].Meh} | 🙁 ${stats[cat].Not}\n`;
  }

  bot.sendMessage(adminChatId, summary, { parse_mode: 'Markdown' });
}

console.log("🤖 Pro Ultra Telegram Bot running...");
