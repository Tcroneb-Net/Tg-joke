import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '@deployed_bots'; // fallback channel/chat ID

  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    // Fetch meme
    const memeRes = await fetch('https://api.imgflip.com/get_memes');
    const memeData = await memeRes.json();
    const memes = memeData.data.memes;
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    const memeUrl = randomMeme.url;

    // Fetch two jokes
    const joke1Res = await fetch('https://v2.jokeapi.dev/joke/Any?type=single');
    const joke1Data = await joke1Res.json();
    const joke1 = joke1Data.joke || 'Here is a meme for you!';

    const joke2Res = await fetch('https://v2.jokeapi.dev/joke/Any?type=single');
    const joke2Data = await joke2Res.json();
    const joke2 = joke2Data.joke || 'Another one just for laughs!';

    // Send meme photo with first joke
    const sendPhoto = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: memeUrl,
        caption: `${joke1}\n\n_Created by_ \`TCRONEB HACKX\``,
        parse_mode: 'Markdown'
      })
    });

    const sendData = await sendPhoto.json();
    if (!sendData.ok) {
      return res.status(500).json({ error: 'Failed to send meme', details: sendData });
    }

    // Reply to meme message with second joke
    const reply = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: joke2,
        reply_to_message_id: sendData.result.message_id
      })
    });

    const replyData = await reply.json();
    if (!replyData.ok) {
      return res.status(500).json({ error: 'Failed to send reply', details: replyData });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
                                                             }
