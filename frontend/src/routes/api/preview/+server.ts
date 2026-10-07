import { json } from '@sveltejs/kit';

const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
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
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            const preview = data?.data?.[0]?.preview;
            if (preview && typeof preview === 'string') {
                return preview;
            }
        }
    } catch (e) {
        console.error(`Deezer preview search error for "${query}":`, e);
    }
    return '';
}

/**
 * Tries fetching a 30s preview URL from iTunes Search API as a reliable fallback.
 */
async function searchITunes(query: string, fetch: typeof globalThis.fetch): Promise<string> {
    try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            const preview = data?.results?.[0]?.previewUrl;
            if (preview && typeof preview === 'string') {
                return preview;
            }
        }
    } catch (e) {
        console.error(`iTunes preview search error for "${query}":`, e);
    }
    return '';
}

/**
 * Resolves a 30s preview URL for a track on demand.
 * 
 * Since Spotify completely deprecated `preview_url` in late 2024 for all standard/dev API keys,
 * this endpoint resolves previews on demand using Deezer, with an automatic iTunes fallback.
 */
export async function GET({ url, fetch }) {
    const rawTitle = url.searchParams.get('title') || '';
    const rawArtist = url.searchParams.get('artist') || '';
    if (!rawTitle || !rawArtist) {
        return json({ previewUrl: '' });
    }

    const key = `${rawTitle}::${rawArtist}`.toLowerCase();
    const cached = cache.get(key);
    if (cached && Date.now() < cached.expires) {
        return json({ previewUrl: cached.url });
    }

    const cleaned = cleanTitle(rawTitle);
    const primaryArtist = getPrimaryArtist(rawArtist);

    // Progressive search queries: from cleanest to broader
    const primaryQuery = `${cleaned || rawTitle} ${primaryArtist}`;
    const fallbackQuery = `${rawTitle} ${primaryArtist}`;

    let previewUrl = await searchDeezer(primaryQuery, fetch);

    if (!previewUrl && fallbackQuery !== primaryQuery) {
        previewUrl = await searchDeezer(fallbackQuery, fetch);
    }

    // If Deezer returned no preview, fall back to Apple iTunes Search API
    if (!previewUrl) {
        previewUrl = await searchITunes(primaryQuery, fetch);
    }

    if (!previewUrl && fallbackQuery !== primaryQuery) {
        previewUrl = await searchITunes(fallbackQuery, fetch);
    }

    cache.set(key, { url: previewUrl, expires: Date.now() + CACHE_TTL_MS });
    return json({ previewUrl });
}
