import { env } from '$env/dynamic/private';

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { doc: any; expires: number }>();

/**
 * Looks up a category's Payload record by slug — specifically for its
 * spotifyPlaylistId, so discovery can pull from a curated playlist instead
 * of a loose genre-keyword search when one has been set up for this category.
 *
 * Cached briefly: this runs on every single discover-page navigation, and
 * category records change rarely, so there's no reason to hit Payload on
 * every click when the last lookup is still fresh.
 */
export async function getCategoryBySlug(slug: string, fetch: typeof globalThis.fetch) {
    const cached = cache.get(slug);
    if (cached && Date.now() < cached.expires) {
        return cached.doc;
    }

    try {
        const url = `${env.PAYLOAD_API_URL}/categories?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const doc = data.docs?.[0] ?? null;
        cache.set(slug, { doc, expires: Date.now() + CACHE_TTL_MS });
        return doc;
    } catch (e) {
        console.error('Error fetching category by slug:', e);
        return null;
    }
}
