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
    if (!imgRes.ok) throw new Error('Failed to fetch anime image');
    const imgData = await imgRes.json();
    const imageUrl = imgData.results?.[0]?.url || '';

    // Fetch two jokes
    const fetchJoke = async () => {
      const res = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
      if (!res.ok) return "Couldn't fetch joke!";
      const data = await res.json();
      return data.joke || "Here's a funny joke!";
    };

    const [joke1, joke2] = await Promise.all([fetchJoke(), fetchJoke()]);

    // Send photo with caption (pro message)
    const caption = `
${greeting}! 👋

🎉 Check out my website monitor bot: [WebMonitor Pro](https://monitor-plus.vercel.app)

💡 Just testing the bot, and it can do a lot automatically:
- Send jokes & anime pics
- Track websites & bots
- Display stats and updates
- Create polls for interaction

Here's a joke for you: 
"${joke1}"

_Created by_ \`TCRONEB HACKX & Team World of Technology\`
`;

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

    // Auto-reply with second joke
    const replyRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: joke2,
        reply_to_message_id: photoData.result.message_id
      })
    });

    const replyData = await replyRes.json();
    if (!replyData.ok) throw new Error('Failed to send reply');

    // Create poll for joke feedback
    const pollRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPoll`, {
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

    const pollData = await pollRes.json();
    if (!pollData.ok) throw new Error('Failed to create poll');

    res.status(200).json({ ok: true, image: imageUrl, jokes: [joke1, joke2] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
