export default async function handler(req, res) {
  const { user_id, bot_token } = req.body;

  // 1. Validate
  const botCheck = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`);
  const botInfo = await botCheck.json();
  if (!botInfo.ok) {
    return res.status(400).json({ error: 'Invalid bot token' });
  }

  // 2. Optional: check user joined your channels using getChatMember
  const chatCheck = await fetch(`https://api.telegram.org/bot${bot_token}/getChatMember?chat_id=@deployed_bots&user_id=${user_id}`);
  const chatInfo = await chatCheck.json();
  if (chatInfo.result?.status !== 'member' && chatInfo.result?.status !== 'administrator') {
    return res.status(403).json({ error: 'Join @deployed_bots first' });
  }

  // 3. Trigger anime message using their bot token
  const anime = await fetch('https://nekos.best/api/v2/neko').then(res => res.json());
  const imageUrl = anime.results[0].url;

  const quote = await fetch('https://v2.jokeapi.dev/joke/Any?type=single').then(res => res.json());

  await fetch(`https://api.telegram.org/bot${bot_token}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: user_id,
      photo: imageUrl,
      caption: `${quote.joke}\n\n_Created by_ \`TCRONEB HACKX\``,
      parse_mode: 'Markdown'
    })
  });

  res.status(200).json({ ok: true, bot: botInfo.result.username });
}
