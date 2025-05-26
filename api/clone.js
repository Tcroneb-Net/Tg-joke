import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).send('Use POST to /api/clone with JSON: { user_id, bot_token }');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, bot_token } = req.body;
  if (!user_id || !bot_token) {
    return res.status(400).json({ error: 'Missing user_id or bot_token' });
  }

  // Validate token
  const me = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`).then(r => r.json());
  if (!me.ok) return res.status(400).json({ error: 'Invalid bot token' });

  // Save to bots.json
  const file = path.resolve('./data/bots.json');
  const bots = JSON.parse(fs.readFileSync(file));
  const exists = bots.find(b => b.token === bot_token);

  if (!exists) {
    bots.push({ token: bot_token, chat_id: user_id });
    fs.writeFileSync(file, JSON.stringify(bots, null, 2));
  }

  res.status(200).json({ success: true, message: `Bot cloned and saved.` });
}
