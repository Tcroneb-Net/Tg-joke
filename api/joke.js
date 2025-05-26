import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }

  try {
    const response = await fetch('https://v2.jokeapi.dev/joke/Any?type=single,twopart');
    if (!response.ok) throw new Error('Failed to fetch joke');

    const jokeData = await response.json();

    let jokeText = '';
    if (jokeData.type === 'single') {
      jokeText = jokeData.joke;
    } else if (jokeData.type === 'twopart') {
      jokeText = `${jokeData.setup}\n${jokeData.delivery}`;
    } else {
      jokeText = 'No joke found.';
    }

    res.status(200).json({ joke: jokeText });
  } catch (error) {
    console.error('Joke API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
