import { env } from '$env/dynamic/private';

let cachedClientToken: string | null = null;
let tokenExpirationTime: number = 0;

export async function getClientCredentialsToken(fetch: typeof globalThis.fetch) {
    if (cachedClientToken && Date.now() < tokenExpirationTime) {
        return cachedClientToken;
    }

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
        if (res.ok) {
            const data = JSON.parse(text);
            cachedClientToken = data.access_token;
            // Spotify tokens usually expire in 3600 seconds (1 hour)
            tokenExpirationTime = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 min buffer
            return cachedClientToken;
        }
    } catch (e) {
        console.error('Error fetching client credentials token:', e);
    }
    return null;
}

let cachedCovers: { url: string; album: string; artist: string }[] = [];
let coversExpirationTime: number = 0;

/**
 * Album art only, for the landing page collage — no preview lookups, so it
 * stays fast. Cached for an hour since the covers don't need to be fresh.
 */
export async function fetchAlbumCovers(fetch: typeof globalThis.fetch, limit = 14) {
    if (cachedCovers.length > 0 && Date.now() < coversExpirationTime) {
        return cachedCovers;
    }

    const token = await getClientCredentialsToken(fetch);
    if (!token) return [];

    try {
        // Heads up: this app's token caps search at limit=10 — anything higher is
        // rejected with a misleading "Invalid limit". So fan out across genres
        // instead of asking one query for more rows.
        const queries = ['genre:pop', 'genre:"hip hop"', 'genre:rock'];

        const pages = await Promise.all(
            queries.map(async (q) => {
                const res = await fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!res.ok) {
                    console.error(`Spotify cover search failed (${q}): ${res.status}`);
                    return [];
                }
                const data = await res.json();
                return data.tracks?.items || [];
            })
        );

        const seen = new Set<string>();
        const covers: { url: string; album: string; artist: string }[] = [];

        // Interleave the genres so neighbouring covers in the collage don't all
        // come from the same one
        const maxLen = Math.max(...pages.map((p) => p.length), 0);
        for (let i = 0; i < maxLen && covers.length < limit; i++) {
            for (const page of pages) {
                const t = page[i];
                const url = t?.album?.images?.[0]?.url;
                const album = t?.album?.name;
                if (!url || !album || seen.has(album)) continue;
                seen.add(album);
                covers.push({ url, album, artist: t.artists?.[0]?.name || '' });
                if (covers.length >= limit) break;
            }
        }

        if (covers.length > 0) {
            cachedCovers = covers;
            coversExpirationTime = Date.now() + 60 * 60 * 1000;
        }
        return cachedCovers;
    } catch (e) {
        console.error('Error fetching album covers:', e);
        return cachedCovers;
    }
}

export async function fetchSpotifyTracks(slug: string, accessToken: string, fetch: typeof globalThis.fetch) {
    let offset = Math.floor(Math.random() * 100);
    const genreMap: Record<string, string> = {
        'pop': 'genre:pop',
        'hip-hop': 'genre:"hip hop"',
        'indie': 'genre:indie',
        'rock': 'genre:rock',
        'r-n-b': 'genre:"r&b"',
        'electronic': 'genre:edm',
        'country': 'genre:country',
        'k-pop': 'genre:"k-pop"'
    };

    const currentYear = new Date().getFullYear();
    let query = genreMap[slug] || `genre:${slug}`;
    if (slug === 'workout') {
         query = 'workout motivation';
    } else if (slug === 'chill') {
         query = 'chill relax';
    } else if (slug === 'top-50') {
         query = `year:${currentYear - 1}-${currentYear}`;
    } else if (slug === 'discover' || slug === 'random') {
         const genres = ['pop', 'rock', 'hip-hop', 'r-n-b', 'indie', 'electronic', 'jazz', 'classical', 'country', 'latin', 'reggae', 'metal', 'soul', 'house', 'techno', 'punk'];
         const randomGenre = genres[Math.floor(Math.random() * genres.length)];
         const chars = 'abcdefghijklmnopqrstuvwxyz';
         const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
         
         // Select a random 5-year window from 1960 to the current year to fetch timeless music
         const startYear = 1960 + Math.floor(Math.random() * (currentYear - 1960 - 5));
         const endYear = startYear + 5;

         const queries = [
             `genre:${randomGenre}`,
             `genre:${randomGenre} ${randomChar}`,
             `year:${startYear}-${endYear} ${randomChar}`,
             `%${randomChar}%`,
             `year:1970-${currentYear}`
         ];
         query = queries[Math.floor(Math.random() * queries.length)];
         offset = Math.floor(Math.random() * 150); // Keep offset safe to avoid empty pages on niche queries
    }
    
    const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&offset=${offset}`;
    
    const res = await fetch(spotifyUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    const text = await res.text();
    if (res.status === 401) return 401;
    if (res.status === 429) return 429;
    if (!res.ok) {
        console.error(`Spotify API error: ${res.status} ${text}`);
        return [];
    }
    
    const data = JSON.parse(text);
    let items = data.tracks?.items || [];
    items = items.sort(() => Math.random() - 0.5);

    const tracksWithPreviews = await Promise.all(items.filter((t: any) => t).map(async (t: any) => {
        let previewUrl = t.preview_url || '';
        const artist = t.artists.map((a: any) => a.name).join(', ');

        if (!previewUrl) {
            try {
                const cleanArtist = t.artists[0]?.name || artist;
                const query = encodeURIComponent(`track:"${t.name}" artist:"${cleanArtist}"`);
                const deezerRes = await fetch(`https://api.deezer.com/search?q=${query}&limit=1`);
                if (deezerRes.ok) {
                    const deezerData = await deezerRes.json();
                    if (deezerData.data && deezerData.data.length > 0) {
                        previewUrl = deezerData.data[0].preview || '';
                    }
                }
            } catch (e) {}
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

    return tracksWithPreviews.filter(t => t.previewUrl);
}

export async function getTracksWithRetry(slug: string, token: string, fetch: typeof globalThis.fetch, cookies: any) {
    if (!token) {
        token = await getClientCredentialsToken(fetch);
    }
    
    if (token) {
        let result = await fetchSpotifyTracks(slug, token, fetch);
        if (result === 401) {
            cookies.delete('spotify_access_token', { path: '/' });
            token = await getClientCredentialsToken(fetch);
            if (token) {
                result = await fetchSpotifyTracks(slug, token, fetch);
            }
        }
        
        if (result === 429) {
            return [{
                id: 'rate-limit',
                spotifyId: 'rate-limit',
                title: 'Spotify Rate Limit Hit 🛑',
                artist: 'You swiped too fast! Wait a minute and refresh.',
                albumArt: 'https://images.unsplash.com/photo-1559583109-3e7968136c99?q=80&w=800&auto=format&fit=crop',
                previewUrl: ''
            }];
        }
        
        // Retry logic if no tracks had previews
        let retries = 2;
        while (Array.isArray(result) && result.length === 0 && retries > 0 && token) {
            result = await fetchSpotifyTracks(slug, token, fetch);
            if (result === 429) {
                return [{
                    id: 'rate-limit',
                    spotifyId: 'rate-limit',
                    title: 'Spotify Rate Limit Hit 🛑',
                    artist: 'You swiped too fast! Wait a minute and refresh.',
                    albumArt: 'https://images.unsplash.com/photo-1559583109-3e7968136c99?q=80&w=800&auto=format&fit=crop',
                    previewUrl: ''
                }];
            }
            retries--;
        }
        
        if (Array.isArray(result)) {
            return result;
        }
    }
    return [];
}
