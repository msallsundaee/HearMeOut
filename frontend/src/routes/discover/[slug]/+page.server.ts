import { env } from '$env/dynamic/private';

export async function load({ params, cookies, fetch }) {
    let token = cookies.get('spotify_access_token');
    
    async function getClientCredentialsToken() {
        try {
            const authOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_SECRET)
                },
                body: new URLSearchParams({ grant_type: 'client_credentials' })
            };
            const res = await fetch('https://accounts.spotify.com/api/token', authOptions);
            const text = await res.text();
            if (res.ok) return JSON.parse(text).access_token;
            console.error('Failed to get client credentials:', text);
        } catch (e) {
            console.error('Error fetching client credentials token:', e);
        }
        return null;
    }

    if (!token) {
        token = await getClientCredentialsToken();
    }

    let tracks: any[] = [];
    
    async function fetchTracks(accessToken: string) {
        // Generate a random offset to fetch different tracks each time
        let offset = Math.floor(Math.random() * 100);
        
        let url = `https://api.spotify.com/v1/search?q=genre:${params.slug}&type=track&limit=10&offset=${offset}`;
        if (params.slug === 'top-50') {
             url = `https://api.spotify.com/v1/search?q=year:2024-2025&type=track&limit=10&offset=${offset}`;
        } else if (params.slug === 'random') {
             // For random discovery, search across recent years with a much larger random offset
             offset = Math.floor(Math.random() * 900); // Spotify max offset is 1000
             url = `https://api.spotify.com/v1/search?q=year:2020-2025&type=track&limit=10&offset=${offset}`;
        }
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        const text = await res.text();
        if (res.status === 401) return 401;
        if (!res.ok) throw new Error(`Spotify API error: ${res.status} ${text}`);
        
        const data = JSON.parse(text);
        let items = data.tracks?.items || [];
        
        // Shuffle the items array so they appear in random order
        items = items.sort(() => Math.random() - 0.5);

        const tracksWithPreviews = await Promise.all(items.filter((t: any) => t).map(async (t: any) => {
            let previewUrl = t.preview_url || '';
            const artist = t.artists.map((a: any) => a.name).join(', ');

            // Spotify frequently omits preview_url now. Fallback to iTunes API.
            if (!previewUrl) {
                try {
                    const query = encodeURIComponent(`${t.name} ${artist}`);
                    const itunesRes = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
                    if (itunesRes.ok) {
                        const itunesData = await itunesRes.json();
                        if (itunesData.results && itunesData.results.length > 0) {
                            previewUrl = itunesData.results[0].previewUrl || '';
                        }
                    }
                } catch (e) {
                    console.error('iTunes fetch failed', e);
                }
            }

            return {
                id: Math.random().toString(36).substring(7),
                spotifyId: t.id,
                title: t.name,
                artist: artist,
                albumArt: t.album.images[0]?.url,
                previewUrl: previewUrl,
                duration_ms: t.duration_ms || 0
            };
        }));

        // Filter out any tracks that STILL don't have a preview URL
        return tracksWithPreviews.filter(t => t.previewUrl);
    }

    if (token) {
        try {
            let result = await fetchTracks(token);
            if (result === 401) {
                // Token is invalid/expired. Delete the dead cookie.
                cookies.delete('spotify_access_token', { path: '/' });
                console.warn('User token expired. Falling back to client credentials.');
                
                // Retry with a fresh app token
                token = await getClientCredentialsToken();
                if (token) {
                    result = await fetchTracks(token);
                }
            }
            if (Array.isArray(result)) {
                tracks = result;
            }
        } catch (e) {
            console.error('Failed to fetch from Spotify:', e);
        }
    }

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
