import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '@tbadibwoytech';
  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    // Get current date
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });

    // Fetch news from NewsAPI
    const newsRes = await fetch('https://newsapi.org/v2/everything?q=Apple&from=2025-09-30&sortBy=popularity&apiKey=662f1841750f4f23897b75259064ffd4');
    const newsData = await newsRes.json();
    if (!newsData.articles || newsData.articles.length === 0) throw new Error('No news found');

    // Take top 5 articles
    const topArticles = newsData.articles.slice(0,5);

    // Format message
    let message = `📰 *Latest News on Apple*\n📅 ${dateStr}\n⏰ ${timeStr}\n\n`;
    topArticles.forEach((a,i)=>{
      message += `*${i+1}. ${a.title}*\n${a.description ? a.description + '\n' : ''}[Read more](${a.url})\n\n`;
    });

    message += `_Created by_ \`TCRONEB HACKX & Team World of Technology\``;

    // Send message to Telegram
    const sendMsgRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
      })
    });

    const msgData = await sendMsgRes.json();
    if (!msgData.ok) throw new Error('Failed to send news');

    res.status(200).json({ ok: true, newsCount: topArticles.length, date: dateStr, time: timeStr });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
