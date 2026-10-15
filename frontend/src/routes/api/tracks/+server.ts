import { json } from '@sveltejs/kit';
import { getTracksWithRetry } from '$lib/server/spotify';
import { getCategoryBySlug } from '$lib/server/categories';

export async function GET({ url, cookies, fetch }) {
    let token = cookies.get('spotify_access_token');
    const rawSlug = url.searchParams.get('slug') || 'explore';
    const slug = rawSlug === 'discover' ? 'explore' : rawSlug;

    const excludeParam = url.searchParams.get('exclude') || '';
    const cookieRecent = cookies.get('hearmeout_recent_seen') || '';
    const allExcludeStrings = [
        ...excludeParam.split(','),
        ...cookieRecent.split(',')
    ].map((s) => s.trim()).filter(Boolean);
    const excludeIds = new Set(allExcludeStrings);

    const categoryPlaylistId = slug === 'explore'
        ? undefined
        : getCategoryBySlug(slug, fetch).then(
            (category) => category?.spotifyPlaylistId || undefined
        );
    const result = await getTracksWithRetry(slug, token, fetch, cookies, categoryPlaylistId, excludeIds);
    return json(result);
}
