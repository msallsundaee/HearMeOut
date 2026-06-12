import { getTracksWithRetry } from '$lib/server/spotify';

export async function load({ params, cookies, fetch }) {
    let token = cookies.get('spotify_access_token');
    
    let tracks = await getTracksWithRetry(params.slug, token, fetch, cookies);

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
