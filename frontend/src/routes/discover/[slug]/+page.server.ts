import { redirect } from '@sveltejs/kit';
import { getTracksWithRetry } from '$lib/server/spotify';
import { getCategoryBySlug, formatCategoryTitle } from '$lib/server/categories';

export async function load({ params, cookies, fetch, setHeaders }) {
    if (params.slug === 'discover') {
        throw redirect(308, '/discover/explore');
    }

    let token = cookies.get('spotify_access_token');

    // Never cache dynamic discovery crates in the browser,
    // so refreshing always fetches fresh songs instead of replaying the same 1st song.
    setHeaders({
        'cache-control': 'no-store, no-cache, must-revalidate, max-age=0'
    });

    const recentSeenRaw = cookies.get('hearmeout_recent_seen') || '';
    const excludeIds = new Set<string>(
        recentSeenRaw
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
    );

    // Explore always uses eclectic multi-genre discovery mix; other categories use their curated playlist
    const categoryPlaylistId = params.slug === 'explore'
        ? undefined
        : getCategoryBySlug(params.slug, fetch).then(
            (category) => category?.spotifyPlaylistId || undefined
        );
    let tracks = await getTracksWithRetry(params.slug, token, fetch, cookies, categoryPlaylistId, excludeIds);

    const categoryName = formatCategoryTitle(params.slug);

    return {
        categorySlug: params.slug,
        categoryName,
        tracks
    };
}
