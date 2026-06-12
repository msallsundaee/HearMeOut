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
    const payloadSaveUrl = `${env.PAYLOAD_API_URL}/swipe-history`;
    try {
        await fetch(payloadSaveUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `API-Key ${env.PAYLOAD_API_KEY}`
            },
            body: JSON.stringify({
                // Payload expects relationship fields to be IDs or object IDs.
                // You will need to upsert the track to Payload Tracks collection first, then pass the Payload ID here.
                // For now we just pass the Spotify ID string (will need backend Track ingestion logic later)
                // track: track.spotifyId,
                action: direction === 'right' ? 'save' : 'skip',
            })
        });
    } catch (e) {
        console.error('Failed to save to Payload CMS:', e);
    }

    return json({ success: true, message: `Swipe ${direction} recorded.` });
}
