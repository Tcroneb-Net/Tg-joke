// server.js
import express from 'express';
import jokeHandler from './api/joke.js';
import animeHandler from './api/anime.js';
import cloneHandler from './api/clone.js';

const app = express();
app.use(express.json());

app.post('/api/joke', jokeHandler);
app.post('/api/anime', animeHandler);
app.post('/api/clone', cloneHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
