import { json } from '@sveltejs/kit';

const CACHE_TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { url: string; expires: number }>();

/**
 * Resolves a 30s preview URL for one track via Deezer, on demand — called by
 * SwipeCard only for the card actually being looked at, instead of the old
 * approach of resolving this for every track in a batch before the page
 * could even render (see the comment on toAppTrack in lib/server/spotify.ts
 * for why that was removed).
 */
export async function GET({ url, fetch }) {
    const title = url.searchParams.get('title') || '';
    const artist = url.searchParams.get('artist') || '';
    if (!title || !artist) {
        return json({ previewUrl: '' });
    }

    const key = `${title}::${artist}`.toLowerCase();
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expires) {
        return json({ previewUrl: cached.url });
    }

    let previewUrl = '';
    try {
        const query = encodeURIComponent(`track:"${title}" artist:"${artist}"`);
        const res = await fetch(`https://api.deezer.com/search?q=${query}&limit=1`);
        if (res.ok) {
            const data = await res.json();
            previewUrl = data.data?.[0]?.preview || '';
        }
    } catch (e) {
        console.error('Preview lookup failed:', e);
    }

    cache.set(key, { url: previewUrl, expires: Date.now() + CACHE_TTL_MS });
    return json({ previewUrl });
}
