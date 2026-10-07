import { fetchAlbumCovers } from '$lib/server/spotify';

export async function load({ fetch, setHeaders }) {
    // Cache covers at the Edge / CDN for 1 hour, stale-while-revalidate for 24 hours.
    // This allows production edge (Vercel, Cloudflare, etc.) to respond in ~20ms.
    setHeaders({
        'cache-control': 'public, max-age=600, s-maxage=3600, stale-while-revalidate=86400'
    });

    return { covers: await fetchAlbumCovers(fetch) };
}
