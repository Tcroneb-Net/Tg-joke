import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '@deployed_bots'; // fallback chat

  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    // Fetch first joke
    const jokeRes1 = await fetch('https://api.imgflip.com/get_memes');
    const jokeData1 = await jokeRes1.json();
    const joke1 = jokeData1.joke || 'Here is a joke!';

    // Fetch second joke to reply
    const jokeRes2 = await fetch('https://v2.jokeapi.dev/joke/Any?type=single');
    const jokeData2 = await jokeRes2.json();
    const joke2 = jokeData2.joke || 'Another joke for you!';

    // Send the first joke
    const sendMsg = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `💬 *JOKE TIME*\n\n${joke1}\n\n_Made by_ \`TCRONEB HACKX\``,
        parse_mode: 'Markdown'
      })
    });

    const msgData = await sendMsg.json();
    if (!msgData.ok) {
      return res.status(500).json({ error: 'Failed to send first joke', details: msgData });
    }

    // Send second joke as reply
    const reply = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: joke2,
        reply_to_message_id: msgData.result.message_id
      })
    });

    const replyData = await reply.json();
    if (!replyData.ok) {
      return res.status(500).json({ error: 'Failed to reply with second joke', details: replyData });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
