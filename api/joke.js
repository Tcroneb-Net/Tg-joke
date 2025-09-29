import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '@tbadibwoytech'; // fallback chat
  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    // === Fetch anime image ===
    const imgRes = await fetch('https://nekos.best/api/v2/neko');
    const imgData = await imgRes.json();
    const imageUrl = imgData.results[0].url;

    // === Fetch first joke (for caption) ===
    const jokeRes1 = await fetch('https://v2.jokeapi.dev/joke/Any?type=single');
    const jokeData1 = await jokeRes1.json();
    const joke1 = jokeData1.joke || '😂 Here is a random joke!';

    // === Fetch second joke (for reply) ===
    const jokeRes2 = await fetch('https://v2.jokeapi.dev/joke/Any?type=single');
    const jokeData2 = await jokeRes2.json();
    const joke2 = jokeData2.joke || '🤣 Another random joke for you!';

    // === Fancy caption (anime + joke + branding) ===
    const caption = `
<b>🌸 𝑨𝒏𝒊𝒎𝒆 + 𝑱𝒐𝒌𝒆 🌸</b>\n
<em>${joke1}</em>\n\n
<b>👑 Powered by:</b> <a href="https://t.me/Tcronebhx">TCRONEB HACKX</a>\n
<b>📢 Channel:</b> <a href="https://t.me/worldoftech4">Join Our Channel</a>\n
<b>💬 Group:</b> <a href="https://t.me/tbadibwoytech">Join Our Group</a>
`;

    // === Inline keyboard with links and actions ===
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '🔄 New Joke', callback_data: 'new_joke' },
          { text: '📸 New Image', callback_data: 'new_image' }
        ],
        [
          { text: '📢 Join Channel', url: 'https://t.me/worldoftech4' },
          { text: '💬 Join Group', url: 'https://t.me/tbadibwoytech' }
        ]
      ]
    };

    // === Send photo with caption + buttons ===
    const sendPhotoRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: inlineKeyboard
      })
    });

    const photoData = await sendPhotoRes.json();
    if (!photoData.ok) {
      return res.status(500).json({ error: 'Failed to send photo', details: photoData });
    }

    // === Send second joke as styled reply ===
    const replyText = `
<b>💬 Quick Joke:</b>\n
<em>${joke2}</em>
`;

    const replyRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
        reply_to_message_id: photoData.result.message_id,
        parse_mode: 'HTML'
      })
    });

    const replyData = await replyRes.json();
    if (!replyData.ok) {
      return res.status(500).json({ error: 'Failed to send reply joke', details: replyData });
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
