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
        duration_ms: t.duration_ms || 0,
        explicit: Boolean(t.explicit)
    };
}

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
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
    fetch: typeof globalThis.fetch,
    excludeIds?: Set<string>,
    slug?: string
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

        // Fetch a broad 50-track window from the playlist
        const fetchLimit = Math.min(50, Math.max(10, total || 50));
        const maxOffset = Math.max(0, total - fetchLimit);
        const offset = maxOffset > 0 ? Math.floor(Math.random() * maxOffset) : 0;

        const tracksRes = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${fetchLimit}&offset=${offset}&fields=items(track(id,name,type,explicit,artists(id,name),album(images),duration_ms,preview_url))`,
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
        const items = (data.items || [])
            .map((i: any) => i.track)
            .filter((t: any) => t && t.type === 'track' && t.id);

        let filtered = items;
        if (excludeIds && excludeIds.size > 0) {
            filtered = items.filter((t: any) => !excludeIds.has(t.id));
        }

        // If the random window had too many excluded/duplicate tracks and offset > 0,
        // grab another slice from offset 0
        if (filtered.length < 10 && offset > 0) {
            const fallbackRes = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${fetchLimit}&offset=0&fields=items(track(id,name,type,explicit,artists(id,name),album(images),duration_ms,preview_url))`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    signal: AbortSignal.timeout(4000)
                }
            );
            if (fallbackRes.ok) {
                const fbData = await fallbackRes.json();
                const fbItems = (fbData.items || [])
                    .map((i: any) => i.track)
                    .filter((t: any) => t && t.type === 'track' && t.id);
                const seenIds = new Set(filtered.map((t: any) => t.id));
                for (const t of fbItems) {
                    if (!seenIds.has(t.id) && (!excludeIds || !excludeIds.has(t.id))) {
                        filtered.push(t);
                    }
                }
            }
        }

        // If still fewer than 10 unseen tracks (e.g. playlist is small and user swiped most of it),
        // supplement with search queries for this genre so the crate never dead-ends
        if (filtered.length < 10 && slug) {
            const searchSupplement = await fetchSpotifyTracks(slug, accessToken, fetch, excludeIds);
            if (Array.isArray(searchSupplement) && searchSupplement.length > 0) {
                const combined = [...shuffleArray(filtered).map(toAppTrack), ...searchSupplement];
                const finalSeen = new Set<string>();
                const deduped: any[] = [];
                for (const t of combined) {
                    if (!finalSeen.has(t.spotifyId)) {
                        finalSeen.add(t.spotifyId);
                        deduped.push(t);
                    }
                }
                return deduped.slice(0, 10);
            }
        }

        return shuffleArray(filtered).slice(0, 10).map(toAppTrack);
    } catch (e) {
        console.error('Error fetching playlist tracks:', e);
        return [];
    }
}

const GENRE_QUERY_POOLS: Record<string, string[]> = {
    'opm': ['tagalog hits', 'pinoy pop', 'opm hits', 'pinoy rock', 'opm essentials'],
    'pop': ['genre:pop', 'top pop hits', 'pop hits', 'billboard pop', 'pop essentials'],
    'hip-hop': ['genre:hip-hop', 'genre:rap', 'hip hop hits', 'rap classics'],
    'r-n-b': ['genre:r-n-b', 'r&b soul', 'contemporary r&b', 'r&b classics'],
    'indie': ['genre:indie', 'genre:indie-pop', 'indie rock', 'bedroom pop'],
    'rock': ['genre:rock', 'rock classics', 'modern rock', 'alt rock'],
    'k-pop': ['genre:k-pop', 'kpop hits', 'korean pop', 'kpop girl group'],
    'j-pop': ['genre:j-pop', 'j-pop hits', 'anime hits', 'japanese pop'],
    'latin': ['genre:latin', 'genre:reggaeton', 'latin pop', 'musica latina'],
    'afrobeats': ['genre:afrobeats', 'afrobeats hits', 'amapiano hits', 'afropop'],
    'electronic': ['genre:edm', 'genre:house', 'dance electronic', 'electro house'],
    'country': ['genre:country', 'country hits', 'modern country', 'country classics'],
    'jazz': ['genre:jazz', 'jazz classics', 'smooth jazz', 'vocal jazz'],
    'lo-fi': ['lofi beats', 'lo-fi chill', 'lofi study', 'chillhop beats'],
    'metal': ['genre:metal', 'heavy metal', 'metalcore', 'thrash metal'],
    'classical': ['genre:classical', 'classical essentials', 'orchestral classical', 'piano classical'],
    'workout': ['workout hits', 'gym motivation hits', 'high energy workout beats', 'fitness music'],
    'chill': ['chill hits', 'chill acoustic', 'chill lounge', 'acoustic chill']
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

export async function fetchSpotifyTracks(
    slug: string,
    accessToken: string,
    fetch: typeof globalThis.fetch,
    excludeIds?: Set<string>
) {
    if (slug === 'explore' || slug === 'discover' || slug === 'random') {
        // Multi-genre eclectic discovery mix: sample across 4 distinct genres
        const shuffledSlugs = shuffleArray([...EXPLORE_GENRES]).slice(0, 4);
        const searchPromises = shuffledSlugs.map((s) => {
            const pool = GENRE_QUERY_POOLS[s] || [s];
            const q = pool[Math.floor(Math.random() * pool.length)];
            const offset = Math.floor(Math.random() * 15);
            return searchSingleQuery(q, 4, offset, accessToken, fetch);
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
                    if (t && t.id && !seen.has(t.id) && !excludeIds?.has(t.id)) {
                        seen.add(t.id);
                        mixedItems.push(t);
                    }
                }
            }
        }

        // If eclectic pool was too small, grab from additional distinct genres (never just pop!)
        if (mixedItems.length < 10) {
            const extraGenres = shuffleArray(EXPLORE_GENRES.filter((g) => !shuffledSlugs.includes(g))).slice(0, 3);
            for (const eg of extraGenres) {
                const pool = GENRE_QUERY_POOLS[eg] || [eg];
                const q = pool[Math.floor(Math.random() * pool.length)];
                const extraRes = await searchSingleQuery(q, 4, Math.floor(Math.random() * 10), accessToken, fetch);
                if (Array.isArray(extraRes)) {
                    for (const t of extraRes) {
                        if (t && t.id && !seen.has(t.id) && !excludeIds?.has(t.id)) {
                            seen.add(t.id);
                            mixedItems.push(t);
                        }
                    }
                }
            }
        }

        return shuffleArray(mixedItems).slice(0, 10).map(toAppTrack);
    }

    let query: string;
    if (slug === 'top-50') {
        const currentYear = new Date().getFullYear();
        query = `year:${currentYear - 1}-${currentYear}`;
        const offset = Math.floor(Math.random() * 25);
        let items = await searchSingleQuery(query, 20, offset, accessToken, fetch);
        if (items === 401 || items === 429) return items;
        if (!Array.isArray(items)) return [];
        let filtered = items.filter((t: any) => !excludeIds?.has(t.id));
        return shuffleArray(filtered).slice(0, 10).map(toAppTrack);
    }

    const pool = GENRE_QUERY_POOLS[slug] || [slug.replace(/-/g, ' ')];
    const shuffledPool = shuffleArray([...pool]);
    const seen = new Set<string>();
    let collected: any[] = [];

    for (const q of shuffledPool) {
        if (collected.length >= 20) break;
        const offset = Math.floor(Math.random() * 20);
        const res = await searchSingleQuery(q, 10, offset, accessToken, fetch);
        if (res === 401 || res === 429) return res;
        if (Array.isArray(res)) {
            for (const t of res) {
                if (t && t.id && !seen.has(t.id) && !excludeIds?.has(t.id)) {
                    seen.add(t.id);
                    collected.push(t);
                }
            }
        }
    }

    // Fallback: If still under 5 tracks, try offset 0 with this specific genre's primary query
    if (collected.length < 5) {
        const primaryQuery = pool[0];
        const fbRes = await searchSingleQuery(primaryQuery, 10, 0, accessToken, fetch);
        if (fbRes === 401 || fbRes === 429) return fbRes;
        if (Array.isArray(fbRes)) {
            for (const t of fbRes) {
                if (t && t.id && !seen.has(t.id) && !excludeIds?.has(t.id)) {
                    seen.add(t.id);
                    collected.push(t);
                }
            }
        }
    }

    return shuffleArray(collected).slice(0, 10).map(toAppTrack);
}

export async function getTracksWithRetry(
    slug: string,
    token: string | null | undefined,
    fetch: typeof globalThis.fetch,
    cookies: any,
    // Accepts a promise so the caller can kick off the category (Payload)
    // lookup at the same time as this function's own token fetch below,
    // instead of the two chaining into two sequential round trips.
    playlistId?: string | Promise<string | undefined>,
    excludeIds?: Set<string>
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
        // Explore is always eclectic multi-genre discovery
        if (slug !== 'explore' && slug !== 'discover' && slug !== 'random') {
            const resolvedPlaylistId = await playlistId;
            if (resolvedPlaylistId) {
                const fromPlaylist = await fetchTracksFromPlaylist(
                    resolvedPlaylistId,
                    activeToken,
                    fetch,
                    excludeIds,
                    slug
                );
                if (fromPlaylist === 401 || fromPlaylist === 429) return fromPlaylist;
                if (Array.isArray(fromPlaylist) && fromPlaylist.length > 0) return fromPlaylist;
            }
        }
        return fetchSpotifyTracks(slug, activeToken, fetch, excludeIds);
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
                previewUrl: '',
                explicit: false
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
