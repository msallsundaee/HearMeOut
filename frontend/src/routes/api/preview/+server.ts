import { json } from '@sveltejs/kit';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours for hits
const MISS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 mins for misses
const cache = new Map<string, { url: string; expires: number }>();

/**
 * Cleans Spotify track titles by stripping common suffixes that confuse
 * third-party search engines (e.g., "(feat. ...)", "- Remastered 2021", etc.)
 */
function cleanTitle(raw: string): string {
    return raw
        .replace(/\((?:feat\.|feat|featuring|with|remastered|remaster|deluxe|version|live|radio edit|explicit|mono|stereo|bonus track)[^)]*\)/gi, '')
        .replace(/\[(?:feat\.|feat|featuring|with|remastered|remaster|deluxe|version|live|radio edit|explicit|mono|stereo|bonus track)[^\]]*\]/gi, '')
        .replace(/\s*-\s*(?:remastered|remaster|live|radio edit|deluxe|explicit|single version|album version|bonus track|instrumental).*$/gi, '')
        .replace(/["']/g, '')
        .trim();
}

/**
 * Extracts the primary artist from a comma/semicolon-separated list.
 */
function getPrimaryArtist(raw: string): string {
    return raw.split(/[,;&]/)[0].trim();
}

/**
 * Tries fetching a 30s preview URL from Deezer search.
 */
async function searchDeezer(query: string, fetch: typeof globalThis.fetch): Promise<string> {
    try {
        const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`;
        const res = await fetch(url, { signal: AbortSignal.timeout(1400) });
        if (res.ok) {
            const data = await res.json();
            const preview = data?.data?.[0]?.preview;
            if (preview && typeof preview === 'string') {
                return preview;
            }
        }
    } catch (e) {
        // Silently continue to fallback
    }
    return '';
}

/**
 * Tries fetching a 30s preview URL from iTunes Search API as a reliable fallback.
 */
async function searchITunes(query: string, fetch: typeof globalThis.fetch): Promise<string> {
    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
        const res = await fetch(url, { signal: AbortSignal.timeout(1800) });
        if (res.ok) {
            const data = await res.json();
            const preview = data?.results?.[0]?.previewUrl;
            if (preview && typeof preview === 'string') {
                return preview;
            }
        }
    } catch (e) {
        // Silently continue
    }
    return '';
}

/**
 * Resolves a 30s preview URL for a track on demand.
 * 
 * Since Spotify completely deprecated `preview_url` in late 2024 for all standard/dev API keys,
 * this endpoint resolves previews on demand using Deezer, with an automatic iTunes fallback.
 */
export async function GET({ url, fetch, setHeaders }) {
    const rawTitle = url.searchParams.get('title') || '';
    const rawArtist = url.searchParams.get('artist') || '';
    if (!rawTitle || !rawArtist) {
        return json({ previewUrl: '' });
    }

    setHeaders({
        'cache-control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
    });

    const key = `${rawTitle}::${rawArtist}`.toLowerCase();
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expires) {
        return json({ previewUrl: cached.url });
    }

    const cleaned = cleanTitle(rawTitle);
    const primaryArtist = getPrimaryArtist(rawArtist);

    const primaryQuery = `${cleaned || rawTitle} ${primaryArtist}`;
    const fallbackQuery = `${rawTitle} ${primaryArtist}`;
    const queries = fallbackQuery !== primaryQuery ? [primaryQuery, fallbackQuery] : [primaryQuery];

    // Search Deezer in parallel across primary and fallback variations
    const deezerResults = await Promise.all(queries.map((q) => searchDeezer(q, fetch)));
    let previewUrl = deezerResults.find(Boolean) || '';

    // If Deezer returned no preview, try Apple iTunes Search API in parallel
    if (!previewUrl) {
        const iTunesResults = await Promise.all(queries.map((q) => searchITunes(q, fetch)));
        previewUrl = iTunesResults.find(Boolean) || '';
    }

    const ttl = previewUrl ? CACHE_TTL_MS : MISS_CACHE_TTL_MS;
    cache.set(key, { url: previewUrl, expires: Date.now() + ttl });
    return json({ previewUrl });
}
