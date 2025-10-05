import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) throw new Error("BOT_TOKEN not set in env variables");

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
  } catch (err) {
    console.error("Image fetch error:", err);
    return { image: null, category };
  }
}

// --- Fetch a joke ---
async function getJoke() {
  try {
    const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    const data = await res.json();
    return data?.[0] ? `${data[0].setup} - ${data[0].punchline}` : "Here's a joke!";
  } catch (err) {
    console.error("Joke fetch error:", err);
    return "Here's a joke!";
  }
}

// --- Send image with inline voting ---
async function sendRandomContent(chatId) {
  try {
    const { image, category } = await getRandomImage();
    if (!image) return;

    const joke = await getJoke();
    // Escape Markdown special chars
    const safeJoke = joke.replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");
    const safeCategory = category.replace(/([_*[\]()~`>#+-=|{}.!])/g, "\\$1");

    const caption = `🎯 Category: *${safeCategory}*\n\n💡 Joke: "${safeJoke}"\n\nVote below if you like this!`;

    const photo = await bot.sendPhoto(chatId, image, {
      caption,
      parse_mode: 'MarkdownV2',
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

    voteStats[photo.message_id] = { image, category, votes: { Love: 0, Meh: 0, Not: 0 } };
  } catch (err) {
    console.error("Failed to send content:", err);
  }
}

// --- Handle vote clicks ---
bot.on('callback_query', (query) => {
  try {
    const [action, msgId, vote] = query.data.split('|');
    if (action === 'vote' && voteStats[msgId]) {
      voteStats[msgId].votes[vote] += 1;
      bot.answerCallbackQuery(query.id, { text: `You voted: ${vote}` });
    }
  } catch (err) {
    console.error("Vote handling error:", err);
  }
});

// --- Track when bot is added to a group/channel ---
bot.on('my_chat_member', (update) => {
  try {
    const chat = update.my_chat_member?.chat;
    const status = update.my_chat_member?.new_chat_member?.status;
    if (!chat) return;
    if (status === 'member' || status === 'administrator') {
      console.log(`Bot added to ${chat.title || chat.username}`);
      activeChats.add(chat.id);
      sendRandomContent(chat.id);
    }
  } catch (err) {
    console.error("Chat member event error:", err);
  }
});

// --- Manual commands ---
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "🤖 Ultra Premium Bot Active! Posts premium images + jokes every 1 minute with voting.");
});

bot.onText(/\/random/, (msg) => {
  sendRandomContent(msg.chat.id);
});

// --- Auto-post every 1 minute ---
setInterval(() => {
  activeChats.forEach(chatId => sendRandomContent(chatId));
}, 60 * 1000);

console.log("🤖 Ultra Premium Telegram Bot running...");
