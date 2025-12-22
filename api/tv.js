import fetch from "node-fetch";

export default async function handler(req, res) {
  const chatId = req.query.chat_id || "@worldoftech4";

  try {
    const sendPhoto = await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          photo: "https://i.ibb.co/rR7XSNhj/Polish-20251222-212825353.jpg",
          caption: `
🇿🇼 *Zimbabwe Update — New File Added!*

✅ *1-Tap LinkLayer file successfully uploaded*
You can now download and use it instantly 🚀

👇 *Download Now*
Use the button below for fast access.

📈 *Goal:*  
Let’s reach *300 users* — more files will be added automatically 🔥  
👉 Comment *“Done”* after downloading.

---

🤖 *Bot Notice*  
This update is posted by the official automation bot.

👤 *About Tcroneb Hackx*  
Tcroneb Hackx is *temporarily unavailable on Telegram*.  
📞 Contact him on *WhatsApp* for now — fixes are in progress and he’ll be back soon.

---

⚙️ *THX AI Coder — V2 Loaded*
API & Website tools are now live.

📘 *Official Documentation*  
https://thx-coder.vercel.app

📱 *Temporary Demo App*  
Built using *DrpidScript*  
https://www.mediafire.com/file/0k77i37fkn4vlpj/THX_AI.apk/file

🔥 More updates coming very soon…
          `,
          parse_mode: "Markdown",
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

    const data = await sendPhoto.json();
    if (!data.ok) throw new Error(data.description);

    res.status(200).json({ ok: true, sent: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
