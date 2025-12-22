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
Zimbabwe Update — New File Added 🇿🇼

1-Tap LinkLayer file has been added successfully.
Go download now.

Download link:
https://worldoftech.qzz.io/home#downloads
or
https://worldoftech.nett.to/home#downloads

Goal:
Let’s reach 300 users to add more files.
Comment "Done" after downloading.

Bot Notice:
This message is posted by the official thx ai v2 automation bot.

Tcroneb Hackx:
He is temporarily not available on Telegram.
Please contact him on WhatsApp for now.
Fixes are in progress and he will be back soon.

THX AI Coder — Version 2 Loaded

Documentation:
https://thx-coder.vercel.app

Temporary Demo App (DrpidScript):
https://www.mediafire.com/file/0k77i37fkn4vlpj/THX_AI.apk/file

More updates coming soon.
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

    const data = await sendPhoto.json();
    if (!data.ok) throw new Error(data.description);

    res.status(200).json({ ok: true, sent: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
