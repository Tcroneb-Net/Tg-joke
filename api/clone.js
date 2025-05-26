// /api/clone.js import fs from 'fs'; import path from 'path';

export default async function handler(req, res) { if (req.method !== 'POST') { return res.status(405).json({ error: 'Method Not Allowed' }); }

try { const { bot_token, user_id, heard_from, captcha_verified } = req.body;

if (!captcha_verified) {
  return res.status(400).json({ error: 'Please verify you are not a robot.' });
}

if (!bot_token || !user_id || !heard_from) {
  return res.status(400).json({ error: 'Missing required fields.' });
}

const dbDir = path.resolve(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'bots.json');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const existingData = fs.existsSync(dbPath)
  ? JSON.parse(fs.readFileSync(dbPath, 'utf8'))
  : [];

existingData.push({
  bot_token,
  user_id,
  heard_from,
  created_at: new Date().toISOString()
});

fs.writeFileSync(dbPath, JSON.stringify(existingData, null, 2));

res.status(200).json({ message: 'Bot cloned and saved successfully!' });

} catch (err) { console.error('Clone error:', err); res.status(500).json({ error: 'Internal Server Error' }); } }

