import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '@tbadibwoytech';
  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    // Time-based greeting
    const hour = new Date().getHours();
    let greeting = 'Hello';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    // Fetch anime image
    const imgRes = await fetch('https://nekos.best/api/v2/neko');
    const imgData = await imgRes.json();
    const imageUrl = imgData.results?.[0]?.url || '';

    // Fetch two jokes
    const fetchJoke = async () => {
      try {
        const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
        if (!res.ok) return "Couldn't fetch joke!";
        const data = await res.json();
        if (!data || !data[0]) return "Here's a funny joke!";
        return `${data[0].setup} - ${data[0].punchline}`;
      } catch {
        return "Here's a funny joke!";
      }
    };

    const [joke1, joke2] = await Promise.all([fetchJoke(), fetchJoke()]);

    // Caption with Markdown
    const caption = `
${greeting}! 👋

🎉 Check out my website monitor bot: [WebMonitor Pro](https://monitor-plus.vercel.app)

💡 Just testing the bot, it can do a lot automatically:
- Send jokes & anime pics
- Track websites & bots
- Display stats and updates
- Create polls for interaction

Here's a joke for you: 
"${joke1}"

_Created by_ \`TCRONEB HACKX & Team World of Technology\`
`;

    // Send photo
    const sendPhotoRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: caption,
        parse_mode: 'Markdown'
      })
    });
    const photoData = await sendPhotoRes.json();
    if (!photoData.ok) throw new Error('Failed to send photo');

    // Reply with second joke
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: joke2,
        reply_to_message_id: photoData.result.message_id
      })
    });

    // Create poll for joke feedback
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPoll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        question: "How's my joke?",
        options: JSON.stringify(["😂 Hilarious", "😐 Meh", "🙁 Not funny"]),
        is_anonymous: false,
        type: "regular",
        reply_to_message_id: photoData.result.message_id
      })
    });

    // Optional: Add inline button to Telegram channel
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🌐 Join our Telegram channel for updates and tips!",
        reply_markup: {
          inline_keyboard: [[{ text: "🚀 Join Channel", url: "https://t.me/worldoftech4" }]]
        }
      })
    });

    res.status(200).json({ ok: true, image: imageUrl, jokes: [joke1, joke2] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
