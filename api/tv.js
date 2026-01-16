import fetch from "node-fetch";

export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    return res.status(500).json({ error: "BOT_TOKEN not set" });
  }

  const chatId = req.query.chat_id || "@worldoftech4";

  const caption = `
🚨 *Important Notice – NPV Tunnel* 🚨
st
👉 Use *NPV Tunnel* first  
📌 Copy & Import the cloud key below

🔑 *NPV Cloud Config (Fast host)* 👇
\`\`\`
npv://PRIMARY-CLOUD-KEY-HERE-123456789
\`\`\`


ℹ️ Join WhatsApp Channel for updates:
https://whatsapp.com/channel/0029Vb6flDp4yltRj3W6NU0z

⚠️ *Notice:*  
Tcroneb Hackx is not available on Telegram right now.

🤖 *Message sent by:*  
*Thx AI – Model v3*

🧩 Developer APIs:
https://thxcoder.zone.id

⚡ Free V2Ray Servers:
https://worldoftech.qzz.io/v2ray

—  
💠 *Thx AI*
`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: "https://i.ibb.co/cGCqxpy/Screenshot-2026-01-15-07-53-14-044-com-napsternetlabs-napsternetv.jpg",
          caption,
          parse_mode: "Markdown",
          disable_web_page_preview: true
        })
      }
    );

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Telegram Error:", err);
    res.status(500).json({ error: err.message });
  }
}
