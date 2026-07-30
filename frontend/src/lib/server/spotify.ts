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

/**
 * NOTE on genre verification: Spotify locked down every piece of genre
 * metadata for apps on standard (non-extended-quota) access back in Nov 2024 —
 * `artist.genres` and `album.genres` come back empty, `GET /v1/artists`
 * (batch) 403s, and `/v1/recommendations` + `/v1/audio-features` both 404.
 * Confirmed directly against this app's own credentials before writing this
 * comment. There is no server-side signal left to check a search result's
 * genre against, so the only real fix is fetchTracksFromPlaylist below: a
 * category with a curated playlist attached is guaranteed accurate because a
 * person put those tracks there on purpose, not because we verified them.
 */

/** Accepts a bare playlist ID, a spotify: URI, or a full open.spotify.com URL. */
function extractPlaylistId(raw: string): string {
    const trimmed = raw.trim();
    const uriMatch = trimmed.match(/spotify:playlist:([a-zA-Z0-9]+)/);
    if (uriMatch) return uriMatch[1];
    const urlMatch = trimmed.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
    if (urlMatch) return urlMatch[1];
    return trimmed;
}

/**
 * Track shape shared by both fetch paths (search results and playlist items
 * have the same track object shape once unwrapped), including the Deezer
 * preview-URL fallback for the tracks Spotify doesn't provide one for.
 */
async function toAppTrack(t: any, fetch: typeof globalThis.fetch) {
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
        artist,
        albumArt: t.album?.images?.[0]?.url,
        previewUrl,
        duration_ms: t.duration_ms || 0
    };
}

/**
 * Pulls a random window of tracks straight from a category's curated Spotify
 * playlist — the most reliable source of "this track actually belongs to
 * this category" there is, since a human (or Spotify editorial) put it there
 * on purpose. Prefer this over the genre search whenever a category has one
 * configured.
 */
export async function fetchTracksFromPlaylist(
    rawPlaylistId: string,
    accessToken: string,
    fetch: typeof globalThis.fetch
) {
    const playlistId = extractPlaylistId(rawPlaylistId);
    if (!playlistId) return [];

    try {
        const metaRes = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}?fields=tracks.total`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (metaRes.status === 401) return 401;
        if (metaRes.status === 429) return 429;
        if (!metaRes.ok) {
            console.error(`Spotify playlist lookup failed: ${metaRes.status} (${playlistId})`);
            return [];
        }

        const meta = await metaRes.json();
        const total = meta?.tracks?.total || 0;
        const offset = total > 10 ? Math.floor(Math.random() * (total - 10)) : 0;

        const tracksRes = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10&offset=${offset}&fields=items(track(id,name,type,artists(id,name),album(images),duration_ms,preview_url))`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (tracksRes.status === 401) return 401;
        if (tracksRes.status === 429) return 429;
        if (!tracksRes.ok) {
            console.error(`Spotify playlist tracks fetch failed: ${tracksRes.status} (${playlistId})`);
            return [];
        }

        const data = await tracksRes.json();
        // Playlists can contain removed tracks (null) or local files/episodes
        // that don't carry the fields we need
        const items = (data.items || [])
            .map((i: any) => i.track)
            .filter((t: any) => t && t.type === 'track' && t.id);

        const tracks = await Promise.all(items.map((t: any) => toAppTrack(t, fetch)));
        return tracks.filter((t) => t.previewUrl);
    } catch (e) {
        console.error('Error fetching playlist tracks:', e);
        return [];
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
    let items = (data.tracks?.items || []).filter((t: any) => t);
    items = items.sort(() => Math.random() - 0.5);

    const tracksWithPreviews = await Promise.all(items.map((t: any) => toAppTrack(t, fetch)));
    return tracksWithPreviews.filter((t) => t.previewUrl);
}

export async function getTracksWithRetry(
    slug: string,
    token: string,
    fetch: typeof globalThis.fetch,
    cookies: any,
    playlistId?: string
) {
    if (!token) {
        token = await getClientCredentialsToken(fetch);
    }

    // Prefer the category's curated playlist when one is configured — falls
    // back to the genre search if the playlist is misconfigured or empty
    // rather than showing nothing.
    async function attempt() {
        if (playlistId) {
            const fromPlaylist = await fetchTracksFromPlaylist(playlistId, token, fetch);
            if (fromPlaylist === 401 || fromPlaylist === 429) return fromPlaylist;
            if (Array.isArray(fromPlaylist) && fromPlaylist.length > 0) return fromPlaylist;
        }
        return fetchSpotifyTracks(slug, token, fetch);
    }

    if (token) {
        let result = await attempt();
        if (result === 401) {
            cookies.delete('spotify_access_token', { path: '/' });
            token = await getClientCredentialsToken(fetch);
            if (token) {
                result = await attempt();
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
            result = await attempt();
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
