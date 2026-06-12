export async function load({ cookies }) {
    const payloadToken = cookies.get('payload_token');
    const spotifyToken = cookies.get('spotify_access_token');
    return {
        isLoggedIn: !!payloadToken,
        hasSpotifyToken: !!spotifyToken
    };
}
