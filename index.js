const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const express = require('express');

const bot = new TelegramBot('7650420681:AAGjm8LiVNCNZHw_SJqzB-NaP9WoMgmtTLs', { polling: true });
const app = express();

// Start webhook (optional if you're on Vercel/Render)
// app.listen(3000, () => console.log('Bot is running on port 3000'));

bot.onText(/\/start/, (msg) => {
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Check DNS', callback_data: 'dns_lookup' }]
      ]
    }
  };
  bot.sendMessage(msg.chat.id, 'Welcome! Click the button to check DNS info.', opts);
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'dns_lookup') {
    bot.sendMessage(chatId, 'Please send me the hostname (e.g. `google.com`) to lookup.', {
      parse_mode: 'Markdown'
    });

    // Wait for next message
    bot.once('message', async (msg) => {
      const hostname = msg.text.trim().replace(/https?:\/\//, '');

      try {
        const res = await fetch(`https://networkcalc.com/api/dns/lookup/${hostname}`);
        const json = await res.json();

        if (json && json.records) {
          let reply = `*DNS Lookup for:* \`${hostname}\`\n\`\`\`\n`;

          for (const [type, records] of Object.entries(json.records)) {
            reply += `${type}:\n`;
            records.forEach(r => {
              reply += `  - ${JSON.stringify(r)}\n`;
            });
            reply += '\n';
          }

          reply += '```';
          bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
        } else {
          bot.sendMessage(chatId, 'No DNS records found.');
        }
      } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, 'Error fetching DNS info.');
      }
    });
  }
});
