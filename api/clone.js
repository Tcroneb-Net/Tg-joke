export default async function handler(req, res) {
  const { user_id, bot_token } = req.body;

  // 1. Validate the user’s bot token
  const botCheck = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`);
  const botInfo = await botCheck.json();
  if (!botInfo.ok) {
    return res.status(400).json({ error: 'Invalid bot token' });
  }

  // 2. Use YOUR MAIN BOT TOKEN to check if the user joined the channel
  const YOUR_MAIN_BOT_TOKEN = process.env.MY_BOT; // add in .env

  const joinCheck = await fetch(`https://api.telegram.org/bot${YOUR_MAIN_BOT_TOKEN}/getChatMember?chat_id=@deployed_bots&user_id=${user_id}`);
  const joinInfo = await joinCheck.json();

  if (!joinInfo.ok || (joinInfo.result.status !== 'member' && joinInfo.result.status !== 'administrator')) {
    return res.status(403).json({ error: 'Join @deployed_bots first' });
  }

  // 3. Fetch anime image
  const anime = await fetch('https://nekos.best/api/v2/neko').then(r => r.json());
  const imageUrl = anime.results[0].url;

  // 4. Fetch a joke or quote
  const quote = await fetch('https://v2.jokeapi.dev/joke/Any?type=single').then(r => r.json());

  // 5. Send using user's bot
  await fetch(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: user_id,
      photo: imageUrl,
      caption: `ANIME QUOTE:\n\n${quote.joke}\n\n\`TCRONEB HACKX\``,
      parse_mode: 'Markdown'
    })
  });

  res.status(200).json({ ok: true, bot: botInfo.result.username });
}
