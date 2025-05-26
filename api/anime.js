import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const imgRes = await fetch('https://nekos.best/api/v2/neko');
    const data = await imgRes.json();
    const imageUrl = data.results[0].url;

    const caption = `*ANIME QUOTE*\n\n_Made by_ \`TCRONEB HACKX\``;

    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: req.query.chat_id,
        photo: imageUrl,
        caption: caption,
        parse_mode: 'Markdown'
      })
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
