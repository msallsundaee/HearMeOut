import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET({ url, cookies, fetch }) {
    let token = cookies.get('spotify_access_token');
    const slug = url.searchParams.get('slug') || 'pop';
    
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
        } catch (e) {
            console.error(e);
        }
        return null;
    }

    if (!token) {
        token = await getClientCredentialsToken();
    }

    async function fetchTracks(accessToken: string) {
        let offset = Math.floor(Math.random() * 100);
        let spotifyUrl = `https://api.spotify.com/v1/search?q=genre:${slug}&type=track&limit=10&offset=${offset}`;
        if (slug === 'top-50') {
             spotifyUrl = `https://api.spotify.com/v1/search?q=year:2024-2025&type=track&limit=10&offset=${offset}`;
        } else if (slug === 'random') {
             offset = Math.floor(Math.random() * 900);
             spotifyUrl = `https://api.spotify.com/v1/search?q=year:2020-2025&type=track&limit=10&offset=${offset}`;
        }
        
        const res = await fetch(spotifyUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
        const text = await res.text();
        if (res.status === 401) return 401;
        if (!res.ok) throw new Error(`Spotify API error: ${res.status} ${text}`);
        
        const data = JSON.parse(text);
        let items = data.tracks?.items || [];
        items = items.sort(() => Math.random() - 0.5);

        const tracksWithPreviews = await Promise.all(items.filter((t: any) => t).map(async (t: any) => {
            let previewUrl = t.preview_url || '';
            const artist = t.artists.map((a: any) => a.name).join(', ');

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
                } catch (e) {}
            }

            return {
                id: Math.random().toString(36).substring(7), // Unique ID for Svelte each loop
                spotifyId: t.id,
                title: t.name,
                artist: artist,
                albumArt: t.album.images[0]?.url,
                previewUrl: previewUrl,
                duration_ms: t.duration_ms || 0
            };
        }));

        return tracksWithPreviews.filter(t => t.previewUrl);
    }

    if (token) {
        let result = await fetchTracks(token);
        if (result === 401) {
            cookies.delete('spotify_access_token', { path: '/' });
            token = await getClientCredentialsToken();
            if (token) {
                result = await fetchTracks(token);
            }
        }
        if (Array.isArray(result)) {
            return json(result);
        }
    }
    return json([]);
}
