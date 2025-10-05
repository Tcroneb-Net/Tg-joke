import fetch from 'node-fetch';

export default async function handler(req, res) {
  const chatId = req.query.chat_id || '@mixedwallpaper';
  if (!chatId) return res.status(400).json({ error: 'chat_id is required' });

  try {
    // --- Premium categories ---
    const categories = [
      'Anime 4K', 'Action Actors', 'Cute Girl', 'Fantasy Art', 'Digital Art',
      'Kawaii', 'Manga Art', 'Trader', 'Fight', 'Race Car', 'Galaxy', 'Space',
      'Motivation', 'Luxury', 'Sports', 'Cars', 'Technology', 'Gaming'
    ];

    // --- Pick a random category ---
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    // --- Fetch a random image ---
    const imgRes = await fetch(`https://ab-pinetrest.abrahamdw882.workers.dev/?query=${encodeURIComponent(randomCategory)}`);
    const data = await imgRes.json();
    const pins = data.data || [];
    if (!pins.length) throw new Error('No images found');
    const randomPin = pins[Math.floor(Math.random() * pins.length)];
    const imageUrl = randomPin.image;

    // --- Fetch a joke ---
    const jokeRes = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
    const jokeData = await jokeRes.json();
    const joke = jokeData?.[0] ? `${jokeData[0].setup} - ${jokeData[0].punchline}` : "Here's a joke for you!";

    // --- Caption ---
    const caption = `
🎯 Category: *${randomCategory}*

💡 Joke: "${joke}"

_Vote below if you like this!_
`;

    // --- Send the photo silently ---
    const sendPhotoRes = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageUrl,
        caption: caption,
        parse_mode: 'Markdown',
        disable_notification: true
      })
    });
    const photoData = await sendPhotoRes.json();
    if (!photoData.ok) throw new Error('Failed to send photo');

    // --- Poll for voting ---
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPoll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        question: "Do you like this image?",
        options: JSON.stringify(["😍 Love it", "😐 It's okay", "🙁 Not for me"]),
        is_anonymous: false,
        type: "regular",
        allows_multiple_answers: false,
        reply_to_message_id: photoData.result.message_id,
        disable_notification: true
      })
    });

    // --- Optional: inline buttons ---
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🌐 Join our Telegram channel for more updates!",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🚀 Join Channel", url: "https://t.me/worldoftech4" }],
            [{ text: "💻 Visit Website", url: "https://monitor-plus.vercel.app" }]
          ]
        },
        disable_notification: true
      })
    });

    res.status(200).json({ ok: true, category: randomCategory, image: imageUrl, joke });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
        }
