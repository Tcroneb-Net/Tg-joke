import fetch from "node-fetch";

export default async function handler(req, res) {
  const chatId = req.query.chat_id || "@worldoftech4";

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: "https://i.ibb.co/w9qjpVT/Polish-20251226-210436486.jpg",
          caption: `
LinkLayer File Updated ✅

What’s New 🔥🔥
• NPV file added
• 1-Tap download available now
Go download and enjoy fast access.

Download:
https://worldoftech.qzz.io/home#downloads

Live Stream TV:
https://worldoftech.nett.to/tv

CapCut Premium Free APK:
https://worldoftech.nett.to/capcut

Main Website:
https://worldoftech.nett.to

Network & Cyber Tools:
https://worldoftech.qzz.io/home#cyber

By Cyber Coder
More tools coming soon.

Vincent Ganiza (Lil Gaga Traxx09)
https://codeverse.nett.to
          `,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "⬇️ 1-Tap Download",
                  url: "https://worldoftech.qzz.io/home#downloads"
                }
              ]
            ]
          }
        })
      }
    );

    const data = await response.json();
    if (!data.ok) throw new Error(data.description);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
