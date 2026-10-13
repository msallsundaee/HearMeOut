import { json } from '@sveltejs/kit';
import { getTracksWithRetry } from '$lib/server/spotify';
import { getCategoryBySlug } from '$lib/server/categories';

export async function GET({ url, cookies, fetch }) {
    let token = cookies.get('spotify_access_token');
    const rawSlug = url.searchParams.get('slug') || 'explore';
    const slug = rawSlug === 'discover' ? 'explore' : rawSlug;

    const categoryPlaylistId = getCategoryBySlug(slug, fetch).then(
        (category) => category?.spotifyPlaylistId || undefined
    );
    const result = await getTracksWithRetry(slug, token, fetch, cookies, categoryPlaylistId);
    return json(result);
}
