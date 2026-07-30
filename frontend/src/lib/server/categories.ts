import { env } from '$env/dynamic/private';

/**
 * Looks up a category's Payload record by slug — specifically for its
 * spotifyPlaylistId, so discovery can pull from a curated playlist instead
 * of a loose genre-keyword search when one has been set up for this category.
 */
export async function getCategoryBySlug(slug: string, fetch: typeof globalThis.fetch) {
    try {
        const url = `${env.PAYLOAD_API_URL}/categories?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        return data.docs?.[0] ?? null;
    } catch (e) {
        console.error('Error fetching category by slug:', e);
        return null;
    }
}
