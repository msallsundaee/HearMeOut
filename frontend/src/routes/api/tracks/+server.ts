import { json } from '@sveltejs/kit';
import { getTracksWithRetry } from '$lib/server/spotify';

export async function GET({ url, cookies, fetch }) {
    let token = cookies.get('spotify_access_token');
    const slug = url.searchParams.get('slug') || 'pop';
    
    const result = await getTracksWithRetry(slug, token, fetch, cookies);
    return json(result);
}
