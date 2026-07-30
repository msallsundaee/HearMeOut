# HearMeOut

Discover new music with a swipe. Preview a track, swipe right to save it or left to skip, then export everything you've saved straight to a real Spotify playlist.

Think Tinder, but for songs — pick a genre, hear a 30-second preview, and build a playlist without ever leaving the deck.

## How it works

1. **Pick a genre** on the categories screen — Pop, Hip-Hop, Indie, Rock, and more, plus a "Discover" mode that pulls from a random mix.
2. **Swipe through the deck** — drag the album cover left to pass or right to save, or use the on-screen buttons / arrow keys. Each card plays a preview automatically.
3. **Keep browsing endlessly** — the deck fetches more tracks in the background as you swipe, so a genre never runs dry.
4. **Export to Spotify** — from the Saved page, pick which tracks to keep and push them into a new (or existing) playlist on your own Spotify account.

Signing in with Spotify isn't required to start swiping, but it's what lets HearMeOut personalize results and, later, export your saves.

## Tech stack

| | |
|---|---|
| **Frontend** | [SvelteKit](https://kit.svelte.dev/) 2 (Svelte 5, runes) + [Tailwind CSS](https://tailwindcss.com/) 4 |
| **Backend / CMS** | [Payload CMS](https://payloadcms.com/) 3 on [Next.js](https://nextjs.org/), Postgres |
| **Music data** | [Spotify Web API](https://developer.spotify.com/documentation/web-api) (search, playlists, OAuth), with [Deezer](https://developers.deezer.com/api) as a fallback for missing preview URLs |

The **frontend** is the app itself — the swipe deck, auth flow, and everything the user sees. The **backend** is a Payload admin panel used to manage `Categories` (with an optional curated Spotify playlist per category for guaranteed-accurate results), plus `Tracks`, `SwipeHistory`, and `Users`.

## Project structure

```
HearMeOut/
├── frontend/   SvelteKit app — routes, swipe deck, Spotify OAuth, UI
└── backend/    Payload CMS admin — categories, tracks, users, swipe history
```

Each has its own `README.md` with framework-specific notes (dev server commands, etc.).

## Getting started

You'll need Node.js, a Postgres database, and a [Spotify Developer app](https://developer.spotify.com/dashboard) (for a client ID/secret).

### 1. Backend (Payload CMS)

```sh
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL, PAYLOAD_SECRET, PAYLOAD_API_KEY
npm run dev
```

Runs at `http://localhost:3000` — the `/admin` panel is where you create categories (and, optionally, attach a Spotify playlist ID to each one for guaranteed on-genre results).

### 2. Frontend (SvelteKit)

```sh
cd frontend
npm install
cp .env.example .env   # fill in SPOTIFY_CLIENT_ID/SECRET, PAYLOAD_API_URL, PAYLOAD_API_KEY
npm run dev
```

Runs at `http://localhost:5173`. Set your Spotify app's redirect URI to match `SPOTIFY_REDIRECT_URI` in this `.env`.

## A note on music discovery

Every genre is backed by a Spotify search query by default, which is a best-effort match rather than a guarantee — Spotify doesn't expose genre metadata precisely enough to verify results server-side. For a category to be **guaranteed** accurate, attach a curated Spotify playlist ID to it in the admin panel; HearMeOut will pull tracks straight from that playlist instead.
