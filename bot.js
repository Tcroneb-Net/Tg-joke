const TelegramBot = require('node-telegram-bot-api');
const { Pool } = require('pg');

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: 'postgresql://tcronebnet_user:t6Dv8DiGPuOhacrmSXGI1UbvwKyTztto@dpg-d0orqpuuk2gs7390rp80-a.oregon-postgres.render.com/tcronebnet'
});

// Create Telegram bot with your token
const token = 'YOUR_TELEGRAM_BOT_TOKEN'; // <-- Replace with your bot token
const bot = new TelegramBot(token, { polling: true });

// Function to save report to PostgreSQL
async function saveReport(userId, reportText) {
  const query = 'INSERT INTO reports (user_id, report_text) VALUES ($1, $2)';
  const values = [userId, reportText];

  try {
    await pool.query(query, values);
    console.log(`Report saved from user ${userId}`);
  } catch (err) {
    console.error('Error saving report:', err);
  }
}

// Bot listens for messages starting with "/report "
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text && text.toLowerCase().startsWith('/report ')) {
    const report = text.slice(8).trim();

    if (!report) {
      bot.sendMessage(chatId, 'Please provide a report message after /report.');
      return;
    }

    saveReport(chatId, report).then(() => {
      bot.sendMessage(chatId, 'Thanks, your report has been saved!');
    }).catch(() => {
      bot.sendMessage(chatId, 'Sorry, there was an error saving your report.');
    });
  }
});
