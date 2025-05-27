const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Replace these with your real bot token and chat ID
const token = 'YOUR_BOT_TOKEN_HERE';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Fetching anime list...');
  try {
    const res = await fetch('https://random-bot-sooty.vercel.app/anime');
    const data = await res.json();
    const list = data.map((a, i) => `${i + 1}. ${a.name || a.title || 'Untitled'}`).join('\n');
    bot.sendMessage(chatId, list);
  } catch (e) {
    bot.sendMessage(chatId, 'Failed to fetch anime data.');
  }
});
