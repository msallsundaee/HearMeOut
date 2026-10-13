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
 * have the same track object shape once unwrapped).
 *
 * NOTE: this used to also fall back to a Deezer search here, synchronously,
 * for any track missing Spotify's own preview_url. Measured against a live
 * search: Spotify now omits preview_url on effectively 100% of results, which
 * turned that "fallback" into the primary path for every single track on
 * every single page load — each Deezer round trip took ~0.5-1s, all of them
 * blocking the page from rendering at all. That's what made navigation feel
 * slow. Preview URLs are now resolved on-demand per card (see
 * /api/preview/+server.ts and SwipeCard.svelte) once a card is actually the
 * one being looked at, instead of for all ~10 cards before anything paints.
 */
function toAppTrack(t: any) {
    const artist = t.artists.map((a: any) => a.name).join(', ');
    return {
        id: Math.random().toString(36).substring(7),
        spotifyId: t.id,
        title: t.name,
        artist,
        albumArt: t.album?.images?.[0]?.url,
        previewUrl: t.preview_url || '',
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
const playlistTotalsCache = new Map<string, { total: number; expires: number }>();

export async function fetchTracksFromPlaylist(
    rawPlaylistId: string,
    accessToken: string,
    fetch: typeof globalThis.fetch
) {
    const playlistId = extractPlaylistId(rawPlaylistId);
    if (!playlistId) return [];

    try {
        let total = 0;
        const cachedMeta = playlistTotalsCache.get(playlistId);
        if (cachedMeta && Date.now() < cachedMeta.expires) {
            total = cachedMeta.total;
        } else {
            const metaRes = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}?fields=tracks.total`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    signal: AbortSignal.timeout(3000)
                }
            );
            if (metaRes.status === 401) return 401;
            if (metaRes.status === 429) return 429;
            if (!metaRes.ok) {
                console.error(`Spotify playlist lookup failed: ${metaRes.status} (${playlistId})`);
                return [];
            }

            const meta = await metaRes.json();
            total = meta?.tracks?.total || 0;
            playlistTotalsCache.set(playlistId, { total, expires: Date.now() + 2 * 60 * 60 * 1000 });
        }

        const offset = total > 10 ? Math.floor(Math.random() * (total - 10)) : 0;

        const tracksRes = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10&offset=${offset}&fields=items(track(id,name,type,artists(id,name),album(images),duration_ms,preview_url))`,
            {
                headers: { Authorization: `Bearer ${accessToken}` },
                signal: AbortSignal.timeout(4000)
            }
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

        return items.map(toAppTrack);
    } catch (e) {
        console.error('Error fetching playlist tracks:', e);
        return [];
    }
}

const GENRE_QUERY_POOLS: Record<string, string[]> = {
    'opm': ['opm', 'tagalog hits', 'pinoy pop', 'opm love songs', 'pinoy rock'],
    'pop': ['top pop hits', 'pop hits', 'pop classics', 'billboard pop'],
    'hip-hop': ['hip hop', 'rap hits', '90s hip hop', 'hip hop classics'],
    'r-n-b': ['r&b soul', 'contemporary r&b', '90s r&b', 'r&b classics'],
    'indie': ['indie pop', 'indie rock', 'indie vibes', 'bedroom pop'],
    'rock': ['rock classics', 'modern rock', 'alt rock', 'hard rock'],
    'k-pop': ['kpop hits', 'k-pop', 'korean pop', 'kpop girl group'],
    'j-pop': ['j-pop', 'jpop anime', 'japanese pop', 'city pop japan'],
    'latin': ['reggaeton', 'latin pop', 'musica latina', 'bachata hits'],
    'afrobeats': ['afrobeats', 'afrobeats hits', 'amapiano hits', 'afropop'],
    'electronic': ['edm hits', 'house music', 'dance electronic', 'electro house'],
    'country': ['country hits', 'modern country', 'country classics'],
    'jazz': ['jazz classics', 'smooth jazz', 'vocal jazz', 'blue note jazz'],
    'lo-fi': ['lofi chill', 'lo-fi beats', 'lofi study', 'chillhop'],
    'metal': ['heavy metal', 'metalcore', 'metal hits', 'thrash metal'],
    'classical': ['classical essentials', 'beethoven chopin', 'orchestral classical', 'piano classical'],
    'workout': ['workout motivation', 'gym pump hits', 'high energy workout'],
    'chill': ['chill acoustic', 'chill lounge', 'relaxing acoustic hits', 'acoustic chill']
};

const EXPLORE_GENRES = [
    'pop', 'indie', 'r-n-b', 'afrobeats', 'hip-hop', 'latin', 'electronic', 'opm', 'k-pop', 'rock', 'chill'
];

async function searchSingleQuery(
    q: string,
    limit: number,
    offset: number,
    accessToken: string,
    fetch: typeof globalThis.fetch
): Promise<any[] | 401 | 429> {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}&offset=${offset}`;
    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(4000)
        });
        if (res.status === 401) return 401;
        if (res.status === 429) return 429;
        if (!res.ok) {
            console.error(`Spotify API error for "${q}": ${res.status}`);
            return [];
        }
        const data = await res.json();
        const items = (data.tracks?.items || []).filter((t: any) => t);
        if (items.length === 0 && offset > 0) {
            const fallbackUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${limit}&offset=0`;
            const fbRes = await fetch(fallbackUrl, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                signal: AbortSignal.timeout(3000)
            });
            if (fbRes.ok) {
                const fbData = await fbRes.json();
                return (fbData.tracks?.items || []).filter((t: any) => t);
            }
        }
        return items;
    } catch {
        return [];
    }
}

export async function fetchSpotifyTracks(slug: string, accessToken: string, fetch: typeof globalThis.fetch) {
    if (slug === 'explore' || slug === 'discover' || slug === 'random') {
        // Multi-genre eclectic discovery mix: sample across 3 distinct genres
        const shuffledSlugs = [...EXPLORE_GENRES].sort(() => Math.random() - 0.5).slice(0, 3);
        const subQueries = shuffledSlugs.map((s) => {
            const pool = GENRE_QUERY_POOLS[s] || [s];
            return pool[Math.floor(Math.random() * pool.length)];
        });

        const limits = [4, 3, 3];
        const searchPromises = subQueries.map((q, i) => {
            const offset = Math.floor(Math.random() * 12);
            return searchSingleQuery(q, limits[i], offset, accessToken, fetch);
        });

        const batchResults = await Promise.all(searchPromises);
        for (const res of batchResults) {
            if (res === 401 || res === 429) return res;
        }

        const seen = new Set<string>();
        let mixedItems: any[] = [];
        for (const res of batchResults) {
            if (Array.isArray(res)) {
                for (const t of res) {
                    if (t && t.id && !seen.has(t.id)) {
                        seen.add(t.id);
                        mixedItems.push(t);
                    }
                }
            }
        }

        if (mixedItems.length < 5) {
            const fbRes = await searchSingleQuery('top pop hits', 10, 0, accessToken, fetch);
            if (fbRes === 401 || fbRes === 429) return fbRes;
            if (Array.isArray(fbRes)) {
                for (const t of fbRes) {
                    if (t && t.id && !seen.has(t.id)) {
                        seen.add(t.id);
                        mixedItems.push(t);
                    }
                }
            }
        }

        mixedItems = mixedItems.sort(() => Math.random() - 0.5);
        return mixedItems.map(toAppTrack);
    }

    let query: string;
    if (slug === 'top-50') {
        const currentYear = new Date().getFullYear();
        query = `year:${currentYear - 1}-${currentYear}`;
    } else {
        const pool = GENRE_QUERY_POOLS[slug];
        if (pool && pool.length > 0) {
            query = pool[Math.floor(Math.random() * pool.length)];
        } else {
            query = slug.replace(/-/g, ' ');
        }
    }

    const initialOffset = Math.floor(Math.random() * 20);
    let items = await searchSingleQuery(query, 10, initialOffset, accessToken, fetch);
    if (items === 401 || items === 429) return items;

    if (!Array.isArray(items)) return [];
    items = items.sort(() => Math.random() - 0.5);
    return items.map(toAppTrack);
}

export async function getTracksWithRetry(
    slug: string,
    token: string | null | undefined,
    fetch: typeof globalThis.fetch,
    cookies: any,
    // Accepts a promise so the caller can kick off the category (Payload)
    // lookup at the same time as this function's own token fetch below,
    // instead of the two chaining into two sequential round trips.
    playlistId?: string | Promise<string | undefined>
) {
    let activeToken = token;
    if (!activeToken) {
        activeToken = await getClientCredentialsToken(fetch);
    }

    // Prefer the category's curated playlist when one is configured — falls
    // back to the genre search if the playlist is misconfigured or empty
    // rather than showing nothing.
    async function attempt() {
        if (!activeToken) return [];
        const resolvedPlaylistId = await playlistId;
        if (resolvedPlaylistId) {
            const fromPlaylist = await fetchTracksFromPlaylist(resolvedPlaylistId, activeToken, fetch);
            if (fromPlaylist === 401 || fromPlaylist === 429) return fromPlaylist;
            if (Array.isArray(fromPlaylist) && fromPlaylist.length > 0) return fromPlaylist;
        }
        return fetchSpotifyTracks(slug, activeToken, fetch);
    }

    if (activeToken) {
        let result = await attempt();
        if (result === 401) {
            cookies.delete('spotify_access_token', { path: '/' });
            activeToken = await getClientCredentialsToken(fetch);
            if (activeToken) {
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

        // Quick single retry if first attempt was empty
        if (Array.isArray(result) && result.length === 0 && token) {
            result = await attempt();
        }

        if (Array.isArray(result)) {
            return result;
        }
    }
    return [];
}
