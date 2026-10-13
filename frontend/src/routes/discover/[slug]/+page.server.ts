import { redirect } from '@sveltejs/kit';
import { getTracksWithRetry } from '$lib/server/spotify';
import { getCategoryBySlug, formatCategoryTitle } from '$lib/server/categories';

export async function load({ params, cookies, fetch, setHeaders }) {
    if (params.slug === 'discover') {
        throw redirect(308, '/discover/explore');
    }

    let token = cookies.get('spotify_access_token');

    // If guest user without user-specific token, cache at edge briefly to avoid hammering Spotify
    if (!token) {
        setHeaders({
            'cache-control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
        });
    }

    // Start Payload lookup without blocking token acquisition
    const categoryPlaylistId = getCategoryBySlug(params.slug, fetch).then(
        (category) => category?.spotifyPlaylistId || undefined
    );
    let tracks = await getTracksWithRetry(params.slug, token, fetch, cookies, categoryPlaylistId);

    const categoryName = formatCategoryTitle(params.slug);

    return {
        categorySlug: params.slug,
        categoryName,
        tracks
    };
}
