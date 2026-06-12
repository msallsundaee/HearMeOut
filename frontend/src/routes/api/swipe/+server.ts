import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function POST({ request, cookies }) {
    const { track, direction } = await request.json();
    const token = cookies.get('spotify_access_token');
    
    if (direction === 'right') {
        if (!token) {
            return json({ success: false, error: 'login_required', message: 'You must log in to Spotify to save tracks.' }, { status: 401 });
        }
        
        try {
            await fetch(`https://api.spotify.com/v1/me/tracks?ids=${track.spotifyId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (e) {
            console.error('Failed to save track to Spotify', e);
        }
    }

    // 2. Save track and swipe history to Payload CMS
    // This assumes we have a service account or handle auth appropriately
    // For demo, we are just mocking the Payload interaction
    
    /*
    const payloadSaveUrl = `${env.PAYLOAD_API_URL}/swipe-history`;
    await fetch(payloadSaveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            track: track.spotifyId, // Might need to upsert track first in Payload
            action: direction === 'right' ? 'save' : 'skip',
            // user: '...userId...'
        })
    });
    */

    return json({ success: true, message: `Swipe ${direction} recorded.` });
}
