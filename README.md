# Vercel AI SDK Demo

Simple chat demo built with:

- OpenRouter via the OpenAI-compatible API
- `openrouter/free`
- SQLite via `better-sqlite3`
- tools: `getUserOrders`, `getWeather`, `getCurrentTime`

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_SITE_URL=http://localhost:3000
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo prompts

- `What orders does jan@example.com have?`
- `What is the weather in Warsaw?`
- `What time is it in Berlin?`
- `What is the weather in Krakow and what time is it there?`
- `Show me orders`

## Notes

- The SQLite file is created automatically as `local.db`.
- The database is seeded on first run with demo orders for `jan@example.com` and `anna@example.com`.
- The assistant calls dedicated tools for orders, weather, and current time.
- Weather is demo data stored in code for predictable presentations.
- Time is generated live using timezone mappings for supported cities.
