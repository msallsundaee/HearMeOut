import { env } from '$env/dynamic/private';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, { doc: any; expires: number }>();

/**
 * Looks up a category's Payload record by slug — specifically for its
 * spotifyPlaylistId, so discovery can pull from a curated playlist instead
 * of a loose genre-keyword search.
 *
 * Uses an AbortSignal timeout (1.5s) so slow or sleeping backend cold-starts
 * never stall the user's page load.
 */
export async function getCategoryBySlug(slug: string, fetch: typeof globalThis.fetch) {
    const cached = cache.get(slug);
    if (cached && Date.now() < cached.expires) {
        return cached.doc;
    }

    try {
        const url = `${env.PAYLOAD_API_URL}/categories?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`;
        const res = await fetch(url, {
            signal: AbortSignal.timeout(1500)
        });
        if (!res.ok) return null;
        const data = await res.json();
        const doc = data.docs?.[0] ?? null;
        cache.set(slug, { doc, expires: Date.now() + CACHE_TTL_MS });
        return doc;
    } catch {
        // Silently fallback without blocking SSR if Payload is asleep or down
        return null;
    }
}
