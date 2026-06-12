import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const { trackIds } = await request.json();
    const token = cookies.get('spotify_access_token');
    
    if (!token) {
        return json({ success: false, error: 'login_required' }, { status: 401 });
    }

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
        return json({ success: false, error: 'no_tracks' }, { status: 400 });
    }

    // Spotify's save tracks endpoint takes a maximum of 50 IDs at a time.
    // For this prototype, we'll assume there are less than 50 or we chunk them.
    const chunkedIds = [];
    for (let i = 0; i < trackIds.length; i += 50) {
        chunkedIds.push(trackIds.slice(i, i + 50));
    }

    try {
        for (const chunk of chunkedIds) {
            const res = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${chunk.join(',')}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Spotify API error: ${res.status} ${text}`);
            }
        }
        
        return json({ success: true, message: `Exported ${trackIds.length} tracks.` });
    } catch (e) {
        console.error('Failed to export to Spotify', e);
        return json({ success: false, error: 'export_failed' }, { status: 500 });
    }
}
