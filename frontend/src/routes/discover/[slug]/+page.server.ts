import { getTracksWithRetry } from '$lib/server/spotify';
import { getCategoryBySlug } from '$lib/server/categories';

export async function load({ params, cookies, fetch }) {
    let token = cookies.get('spotify_access_token');

    // Neither of these depends on the other, so start the Payload lookup and
    // let getTracksWithRetry await it internally (alongside its own Spotify
    // token fetch) instead of chaining two sequential round trips here.
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
