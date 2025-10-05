import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';

const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// --- Premium categories ---
const categories = [
  'Anime 4K', 'Action Actors', 'Cute Girl', 'Fantasy Art', 'Digital Art',
  'Kawaii', 'Manga Art', 'Trader', 'Fight', 'Race Car', 'Galaxy', 'Space',
  'Motivation', 'Luxury', 'Sports', 'Cars', 'Technology', 'Gaming'
];

// --- Active chats and vote tracking ---
const activeChats = new Set();
const voteStats = {}; // { message_id: { image: url, votes: { Love:0, Meh:0, Not:0 } } }

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

// --- Fetch a joke ---
async function getJoke() {
  try {
    const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    const data = await res.json();
    return data?.[0] ? `${data[0].setup} - ${data[0].punchline}` : "Here's a joke!";
  } catch {
    return "Here's a joke!";
  }
}

// --- Send image with inline voting ---
async function sendRandomContent(chatId) {
  const { image, category } = await getRandomImage();
  if (!image) return;

  const joke = await getJoke();
  const caption = `🎯 Category: *${category}*\n\n💡 Joke: "${joke}"\n\nVote below if you like this!`;

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

    const voteMsg = await bot.sendMessage(chatId, "Cast your vote:", {
      reply_markup: inlineKeyboard,
      disable_notification: true
    });

    // Initialize vote stats
    voteStats[photo.message_id] = { image, category, votes: { Love: 0, Meh: 0, Not: 0 } };
  } catch (err) {
    console.error("Failed to send content:", err);
  }
}

// --- Handle vote clicks ---
bot.on('callback_query', (query) => {
  const [action, msgId, vote] = query.data.split('|');
  if (action === 'vote') {
    if (voteStats[msgId]) {
      voteStats[msgId].votes[vote] += 1;
      bot.answerCallbackQuery(query.id, { text: `You voted: ${vote}` });
    }
  }
});

// --- Track when bot is added to a group/channel ---
bot.on('my_chat_member', async (update) => {
  const chat = update.chat;
  const status = update.new_chat_member?.status;
  if (status === 'member' || status === 'administrator') {
    console.log(`Bot added to ${chat.title || chat.username}`);
    activeChats.add(chat.id);

    // Send first content immediately
    sendRandomContent(chat.id);
  }
});

// --- Manual commands ---
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🤖 Ultra Premium Bot Active! I post premium images + jokes every 1 minute with voting.");
});

bot.onText(/\/random/, (msg) => {
  sendRandomContent(msg.chat.id);
});

// --- Auto-post every 1 minute in all active chats ---
setInterval(() => {
  activeChats.forEach(chatId => sendRandomContent(chatId));
}, 60 * 1000);

console.log("🤖 Ultra Premium Telegram Bot running...");
