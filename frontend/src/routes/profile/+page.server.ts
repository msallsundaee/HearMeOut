import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function load({ cookies, fetch }) {
    const payloadToken = cookies.get('payload_token');
    const spotifyToken = cookies.get('spotify_access_token');
    
    if (!payloadToken) {
        throw redirect(302, '/login');
    }

    // Fetch user details from Payload CMS
    let user = null;
    try {
        const res = await fetch(`${env.PAYLOAD_API_URL}/users/me`, {
            headers: {
                'Authorization': `JWT ${payloadToken}`
            }
        });
        const data = await res.json();
        if (data && data.user) {
            user = data.user;
        }
    } catch (e) {
        console.error('Error fetching user', e);
    }

    return {
        user,
        hasSpotifyToken: !!spotifyToken
    };
}
