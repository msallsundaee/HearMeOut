import { json } from '@sveltejs/kit';

const ITUNES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (iTunes preview links never expire)
const DEEZER_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes (Deezer links carry short-lived CDN tokens)
const MISS_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes for misses

const cache = new Map<string, { url: string; expires: number; source: 'itunes' | 'deezer' }>();

/**
 * Cleans Spotify track titles by stripping common suffixes that confuse
 * search engines (e.g. "(feat. ...)", "- Remastered", "(2011 Remaster)", etc.)
 */
function cleanTitle(raw: string): string {
    return raw
        .replace(/\s*[\(\[](?:feat\.|feat|featuring|with|remastered|remaster|deluxe|version|live|radio edit|explicit|mono|stereo|bonus track|from the|soundtrack|anniversary|taylor's version|\d{4}\s*remaster)[^\)\]]*[\)\]]/gi, '')
        .replace(/\s*-\s*(?:remastered|remaster|live|radio edit|deluxe|explicit|single version|album version|bonus track|instrumental|\d{4}\s*remaster).*$/gi, '')
        .replace(/["'’]/g, '')
        .trim();
}

/**
 * Extracts the primary artist from a comma/semicolon/slash-separated list.
 */
function getPrimaryArtist(raw: string): string {
    return raw.split(/[,;&/]/)[0].trim();
}

/**
 * Searches Apple iTunes for a 30-second audio preview.
 * iTunes URLs are permanent, never expire, and have universal CORS headers.
 */
async function searchITunes(query: string, fetch: typeof globalThis.fetch): Promise<string> {
    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`;
        const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
            const data = await res.json();
            const hit = data?.results?.find((r: any) => r.previewUrl);
            if (hit?.previewUrl && typeof hit.previewUrl === 'string') {
                return hit.previewUrl;
            }
        }
    } catch {
        // Fallback
    }
    return '';
}

/**
 * Searches Deezer for a 30-second audio preview as a secondary provider.
 */
async function searchDeezer(query: string, fetch: typeof globalThis.fetch): Promise<string> {
    try {
        const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;
        const res = await fetch(url, { signal: AbortSignal.timeout(1800) });
        if (res.ok) {
            const data = await res.json();
            const hit = data?.data?.find((d: any) => d.preview);
            if (hit?.preview && typeof hit.preview === 'string') {
                return hit.preview;
            }
        }
    } catch {
        // Fallback
    }
    return '';
}

/**
 * Resolves a 30s preview URL for a track on demand.
 * 
 * Prioritizes Apple iTunes (permanent, non-expiring URLs with global CORS),
 * and uses Deezer as a fast secondary provider.
 */
export async function GET({ url, fetch, setHeaders }) {
    const rawTitle = url.searchParams.get('title') || '';
    const rawArtist = url.searchParams.get('artist') || '';
    const bypassCache = url.searchParams.get('fresh') === '1';

    if (!rawTitle || !rawArtist) {
        return json({ previewUrl: '' });
    }

    const key = `${rawTitle}::${rawArtist}`.toLowerCase();
    const cached = cache.get(key);

    if (!bypassCache && cached && Date.now() < cached.expires) {
        // If it was from iTunes, browser can cache it for 24h. If Deezer, cache short.
        const maxAge = cached.source === 'itunes' ? 86400 : 1800;
        setHeaders({
            'cache-control': `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=86400`
        });
        return json({ previewUrl: cached.url });
    }

    const cleaned = cleanTitle(rawTitle);
    const primaryArtist = getPrimaryArtist(rawArtist);

    // Queries to test in sequence
    const queries = [
        `${cleaned || rawTitle} ${primaryArtist}`.trim(),
        `${rawTitle} ${primaryArtist}`.trim()
    ];
    if (cleaned && cleaned !== rawTitle) {
        queries.push(cleaned);
    }
    const uniqueQueries = Array.from(new Set(queries.filter(Boolean)));

    // 1. Try iTunes first across query variations (permanent URLs)
    const iTunesResults = await Promise.all(uniqueQueries.map((q) => searchITunes(q, fetch)));
    let previewUrl = iTunesResults.find(Boolean) || '';
    let source: 'itunes' | 'deezer' = 'itunes';

    // 2. If iTunes doesn't have it, try Deezer in parallel
    if (!previewUrl) {
        const deezerResults = await Promise.all(uniqueQueries.map((q) => searchDeezer(q, fetch)));
        previewUrl = deezerResults.find(Boolean) || '';
        source = 'deezer';
    }

    // Set cache lifetimes
    const ttl = previewUrl
        ? source === 'itunes'
            ? ITUNES_CACHE_TTL_MS
            : DEEZER_CACHE_TTL_MS
        : MISS_CACHE_TTL_MS;

    cache.set(key, { url: previewUrl, expires: Date.now() + ttl, source });

    const clientMaxAge = previewUrl ? (source === 'itunes' ? 86400 : 1800) : 180;
    setHeaders({
        'cache-control': `public, max-age=${clientMaxAge}, s-maxage=${clientMaxAge}, stale-while-revalidate=86400`
    });

    return json({ previewUrl, source: previewUrl ? source : null });
}
