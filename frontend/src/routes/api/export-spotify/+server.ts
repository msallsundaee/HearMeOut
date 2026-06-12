import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const { trackIds, playlistName, cachedPlaylistId } = await request.json();
    const finalPlaylistName = playlistName?.trim() || 'HearMeOut Discover';
    const token = cookies.get('spotify_access_token');
    
    if (!token) {
        return json({ success: false, error: 'login_required' }, { status: 401 });
    }

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
        return json({ success: false, error: 'no_tracks' }, { status: 400 });
    }

    // Filter out fake track IDs (like "track1") or invalid lengths. Spotify IDs are 22 chars.
    const validTrackIds = trackIds.filter(id => id && id.length >= 15);

    if (validTrackIds.length === 0) {
        return json({ success: false, error: 'no_valid_tracks' }, { status: 400 });
    }

    try {
        // 1. Get User Profile to get User ID
        const profileRes = await fetch('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!profileRes.ok) throw new Error('Failed to fetch user profile');
        const profileData = await profileRes.json();
        const userId = profileData.id;

        // 2. Check if playlist already exists (loop through all pages in case user has > 50 playlists)
        let playlistId = cachedPlaylistId || null;
        let nextUrl = 'https://api.spotify.com/v1/me/playlists?limit=50';
        
        // Only search Spotify if we don't have a cached ID
        while (nextUrl && !playlistId) {
            const playlistsRes = await fetch(nextUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const playlistsData = await playlistsRes.json();
            
            if (playlistsData.items) {
                console.log('Spotify returned playlists:', playlistsData.items.map((p: any) => p.name));
            } else {
                console.log('Spotify returned NO items. Error:', playlistsData);
            }
            
            const found = playlistsData.items?.find((p: any) => p.name === finalPlaylistName);
            if (found) {
                console.log('Found matching playlist!', found.id);
                playlistId = found.id;
            }
            
            nextUrl = playlistsData.next; // null if no more pages
        }

        // 3. If it doesn't exist, create it
        if (!playlistId) {
            const createRes = await fetch(`https://api.spotify.com/v1/me/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: finalPlaylistName,
                    description: 'Tracks discovered via HearMeOut',
                    public: true
                })
            });
            if (!createRes.ok) {
                const errData = await createRes.json().catch(() => ({}));
                throw new Error(errData.error?.message || `Failed to create playlist: ${createRes.status}`);
            }
            const createData = await createRes.json();
            playlistId = createData.id;
        }

        // 4. Add tracks to playlist in chunks of 100 (Spotify API limit for this endpoint)
        const trackUris = validTrackIds.map(id => `spotify:track:${id}`);
        const chunkedUris = [];
        for (let i = 0; i < trackUris.length; i += 100) {
            chunkedUris.push(trackUris.slice(i, i + 100));
        }

        for (const chunk of chunkedUris) {
            const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/items`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uris: chunk })
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Spotify API error adding tracks: ${res.status}`);
            }
        }
        
        return json({ success: true, playlistId: playlistId });
    } catch (e: any) {
        console.error('Failed to export to Spotify', e);
        return json({ success: false, error: e.message || 'export_failed' }, { status: 500 });
    }
}
