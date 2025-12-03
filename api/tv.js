import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '@worldoftech4';

  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    // --- Your custom update content ---
    const UPDATE_TITLE = "🔥 ProStream Live Stream TV — New Update!";
    const UPDATE_DESCRIPTION = `
Watch unlimited Live TV, Sports, Movies & Worldwide IPTV Streams 
with zero buffering and ultra HD quality! 🌍📺

✔ Live Sports
✔ Movies & Series
✔ Worldwide Channels
✔ Smooth & Fast Streaming

Visit now and enjoy premium streaming for FREE!
    `;

    // --- Your promotional image ---
    const IMAGE_URL = "https://i.ibb.co/ymtqT16c/temp.jpg";

    // --- WhatsApp links ---
    const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb6flDp4yltRj3W6NU0z";
    const WHATSAPP_DM = "https://wa.me/message/CJ3LQTT5L4SLK1";

    // --- Live TV stream link ---
    const STREAM_LINK = "https://worldoftech.qzz.io/tv?channel=4Kurd.fr%40SD";

    // --- Build caption ---
    const caption = `
⭐ *${UPDATE_TITLE}*

${UPDATE_DESCRIPTION}

👇 Connect with us for support, updates & more
    `;

    // --- Send the update with image ---
    const sendPhotoRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: IMAGE_URL,
        caption: caption,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📺 I'm Watching This Channel Now", url: STREAM_LINK }],
            [{ text: "💬 Join Our WhatsApp Channel", url: WHATSAPP_CHANNEL }],
            [{ text: "📞 Message Us on WhatsApp", url: WHATSAPP_DM }],
            [{ text: "🌐 Visit Our Website", url: "https://worldoftech.qzz.io" }]
          ]
        }
      })
    });

    const result = await sendPhotoRes.json();
    if (!result.ok) throw new Error("Failed to send update");

    res.status(200).json({ ok: true, sent: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
