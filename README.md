# TCRONEB Joke Bot

This bot sends a random joke to your Telegram chat every 5 minutes using the JokeAPI.

## Setup

1. Deploy to Vercel.
2. Add the following environment variables in the Vercel dashboard:
   - `BOT_TOKEN` – Your Telegram bot token
   - `CHAT_ID` – Your Telegram chat ID

3. Create a free cron job at [https://cron-job.org](https://cron-job.org) to call your deployed endpoint:
   - URL: `https://your-vercel-app.vercel.app/api/joke`
   - Interval: Every 5 minutes

## Credits

Powered by [JokeAPI](https://sv443.net/jokeapi/v2)
