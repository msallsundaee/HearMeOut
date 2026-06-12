export async function load({ cookies }) {
    const token = cookies.get('spotify_access_token');
    return {
        hasSpotifyToken: !!token
    };
}
