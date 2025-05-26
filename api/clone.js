// /api/clone.js import fs from 'fs'; import path from 'path';

export default async function handler(req, res) { if (req.method !== 'POST') { return res.status(405).json({ error: 'Method Not Allowed' }); }

const { bot_token, user_id, heard_from, captcha_verified } = req.body;

if (!captcha_verified) { return res.status(400).json({ error: 'Please verify you are not a robot.' }); }

if (!bot_token || !user_id || !heard_from) { return res.status(400).json({ error: 'Missing required fields.' }); }

const dbPath = path.resolve(process.cwd(), 'data/bots.json');

try { const fileExists = fs.existsSync(dbPath); const oldData = fileExists ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : [];

const newEntry = { bot_token, user_id, heard_from, date: new Date().toISOString() };
oldData.push(newEntry);

fs.writeFileSync(dbPath, JSON.stringify(oldData, null, 2));

// Optionally trigger a backend bot setup script or async worker

return res.status(200).json({ message: 'Cloned and stored successfully!' });

} catch (error) { console.error('Error saving bot data:', error); return res.status(500).json({ error: 'Internal Server Error' }); } }

