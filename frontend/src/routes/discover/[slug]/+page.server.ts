import { getTracksWithRetry } from '$lib/server/spotify';
import { getCategoryBySlug } from '$lib/server/categories';

export async function load({ params, cookies, fetch, setHeaders }) {
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

    if (tracks.length === 0) {
        tracks = [{
            id: '1',
            spotifyId: 'track1',
            title: 'No Tracks Found (Or Invalid Credentials)',
            artist: 'Check your Spotify Client ID/Secret',
            albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
            previewUrl: ''
        }];
    }

    return {
        categorySlug: params.slug,
        tracks
    };
}
