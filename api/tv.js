import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const chatId = req.query.chat_id || "@worldoftech4";
  const BOT_TOKEN = process.env.BOT_TOKEN;

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: "BOT_TOKEN not set" });
  }

  const message = `
🚨 *Important Notice – NPV Tunnel* 🚨

Please use *NPV Tunnel* first.  
📌 *Copy & Import* the config correctly for best performance.

ℹ️ For more information & updates, join our official WhatsApp Channel:
https://whatsapp.com/channel/0029Vb6flDp4yltRj3W6NU0z

⚠️ *Notice:*  
Tcroneb Hackx is currently *not available on Telegram*.

🤖 *Message sent by:*  
*Thx AI – Model v3*

🧩 *Developer APIs:*  
https://thxcoder.zone.id

⚡ *Looking for fast V2Ray servers?*  
Create yours *FREE* here:  
https://worldoftech.qzz.io/v2ray

—  
💠 *Thx AI*
`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: false,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📢 WhatsApp Channel",
                  url: "https://whatsapp.com/channel/0029Vb6flDp4yltRj3W6NU0z"
                }
              ],
              [
                {
                  text: "⚡ Free V2Ray Server",
                  url: "https://worldoftech.qzz.io/v2ray"
                }
              ],
              [
                {
                  text: "🧩 Developer APIs",
                  url: "https://thxcoder.zone.id"
                }
              ]
            ]
          }
        })
      }
    );

    const data = await response.json();
    if (!data.ok) throw new Error(data.description || "Telegram API error");

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Telegram Error:", err);
    res.status(500).json({ error: err.message });
  }
}
