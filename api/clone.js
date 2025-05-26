export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, bot_token } = req.body;

  if (!user_id || !bot_token) {
    return res.status(400).json({ error: 'Missing user_id or bot_token' });
  }

  // Use your own main bot to check if user joined
  const MY_BOT = process.env.MY_BOT;

  const check = await fetch(`https://api.telegram.org/bot${MY_BOT}/getChatMember?chat_id=@deployed_bots&user_id=${user_id}`);
  const data = await check.json();

  if (!data.ok || (data.result.status !== 'member' && data.result.status !== 'administrator')) {
    return res.status(403).json({ error: 'Join @deployed_bots first' });
  }

  // Validate user's bot
  const me = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`).then(r => r.json());
  if (!me.ok) {
    return res.status(400).json({ error: 'Invalid bot token' });
  }

  // Send welcome message with anime + quote
  const [animeRes, jokeRes] = await Promise.all([
    fetch("https://nekos.best/api/v2/neko").then(r => r.json()),
    fetch("https://v2.jokeapi.dev/joke/Any?type=single").then(r => r.json())
  ]);

  const img = animeRes.results[0].url;
  const quote = jokeRes.joke;

  await fetch(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: user_id,
      photo: img,
      caption: `ANIME QUOTE:\n\n${quote}\n\n\`TCRONEB HACKX\``,
      parse_mode: "Markdown"
    })
  });

  res.status(200).json({ success: true, bot: me.result.username });
}
