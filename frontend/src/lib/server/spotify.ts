import { env } from '$env/dynamic/private';
import { getFallbackTracksForGenre } from '$lib/server/fallbackTracks';

let cachedClientToken: string | null = null;
let tokenExpirationTime: number = 0;
let rateLimitedUntil: number = 0;

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
const failedPlaylistsCache = new Map<string, number>();

export async function fetchTracksFromPlaylist(
    rawPlaylistId: string,
    accessToken: string,
    fetch: typeof globalThis.fetch,
    excludeIds?: Set<string>,
    slug?: string
) {
    const playlistId = extractPlaylistId(rawPlaylistId);
    if (!playlistId) return [];

    // Spotify systematically rejects official editorial playlists (37i9dQZF...)
    // under Client Credentials flow with 404 Not Found.
    if (playlistId.startsWith('37i9dQZF')) {
        return [];
    }

    const failedUntil = failedPlaylistsCache.get(playlistId);
    if (failedUntil && Date.now() < failedUntil) {
        return [];
    }

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
                failedPlaylistsCache.set(playlistId, Date.now() + 24 * 60 * 60 * 1000);
                console.warn(`Spotify playlist unavailable (${metaRes.status}): ${playlistId}. Falling back to genre queries.`);
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

export const VERIFIED_GENRE_TAGS: Record<string, string[]> = {
    'opm': [
        'opm', 'pinoy pop', 'pinoy rock', 'pinoy indie', 'tagalog pop',
        'pinoy reggae', 'pinoy trap', 'manila sound', 'tagalog worship', 'vispop'
    ],
    'pop': [
        'pop', 'dance pop', 'synthpop', 'electropop', 'indie pop',
        'art pop', 'post-teen pop', 'europop', 'hyperpop'
    ],
    'hip-hop': [
        'hip hop', 'rap', 'trap', 'conscious hip hop', 'underground hip hop',
        'east coast hip hop', 'west coast rap', 'southern hip hop', 'boom bap', 'melodic rap'
    ],
    'r-n-b': [
        'r&b', 'contemporary r&b', 'soul', 'neo soul', 'urban contemporary',
        'motown', 'quiet storm', 'classic soul', 'alternative r&b', 'indie r&b'
    ],
    'indie': [
        'indie', 'indie rock', 'indie pop', 'bedroom pop', 'indie folk',
        'lo-fi indie', 'modern alternative rock', 'dream pop', 'shoegaze', 'indie garage rock'
    ],
    'rock': [
        'rock', 'classic rock', 'alternative rock', 'hard rock', 'modern rock',
        'album rock', 'garage rock', 'psychedelic rock', 'indie rock', 'glam rock'
    ],
    'k-pop': [
        'k-pop', 'korean pop', 'k-indie', 'k-r&b', 'k-rap',
        'korean ost', 'k-rock', 'korean city pop'
    ],
    'j-pop': [
        'j-pop', 'j-rock', 'japanese pop', 'japanese city pop', 'anime',
        'j-indie', 'japanese alternative rock', 'j-acoustic'
    ],
    'latin': [
        'latin', 'reggaeton', 'latin pop', 'urbano latino', 'trap latino',
        'musica mexicana', 'latin alternative', 'bachata', 'salsa', 'cumbia'
    ],
    'afrobeats': [
        'afrobeats', 'afropop', 'amapiano', 'nigerian pop', 'alte',
        'afro dancehall', 'south african house', 'afro soul'
    ],
    'electronic': [
        'electronic', 'edm', 'house', 'techno', 'synthwave',
        'electro house', 'progressive house', 'deep house', 'future bass', 'drum and bass'
    ],
    'country': [
        'country', 'contemporary country', 'country road', 'classic country',
        'outlaw country', 'americana', 'bluegrass', 'country rock', 'texas country'
    ],
    'jazz': [
        'jazz', 'vocal jazz', 'contemporary jazz', 'bebop', 'cool jazz',
        'hard bop', 'jazz fusion', 'modal jazz', 'smooth jazz', 'bossa nova'
    ],
    'lo-fi': [
        'lo-fi', 'lo-fi beats', 'chillhop', 'lo-fi study', 'lo-fi jazz',
        'japanese lo-fi', 'bedroom lo-fi', 'lo-fi sleep'
    ],
    'metal': [
        'metal', 'heavy metal', 'metalcore', 'thrash metal', 'death metal',
        'alternative metal', 'nu metal', 'power metal', 'progressive metal', 'groove metal'
    ],
    'classical': [
        'classical', 'baroque', 'romantic era', 'orchestral', 'classical piano',
        'chamber orchestra', 'contemporary classical', 'opera'
    ],
    'workout': [
        'workout', 'running', 'gym', 'high energy', 'edm',
        'power workout', 'bass music', 'cardio'
    ],
    'chill': [
        'chill', 'ambient', 'indie folk', 'acoustic', 'downtempo',
        'meditation', 'chillout', 'slowed and reverb', 'folk-pop'
    ]
};

const EXPLORE_GENRES = [
    'indie', 'r-n-b', 'afrobeats', 'hip-hop', 'latin', 'electronic', 'opm', 'k-pop', 'rock', 'chill', 'pop', 'jazz'
];

/**
 * Deduplicates tracks so that no artist appears more than once in the deck,
 * guaranteeing maximum variety and preventing artist fatigue.
 */
function deduplicateArtistsAndTracks(
    tracks: any[],
    excludeIds?: Set<string>,
    maxCount: number = 15
): any[] {
    const seenTrackIds = new Set<string>();
    const seenArtists = new Set<string>();
    const result: any[] = [];

    for (const t of tracks) {
        if (!t || !t.id) continue;
        if (excludeIds && excludeIds.has(t.id)) continue;
        if (seenTrackIds.has(t.id)) continue;

        const primaryArtist = (t.artists?.[0]?.name || '').toLowerCase().trim();
        if (primaryArtist && seenArtists.has(primaryArtist)) {
            continue;
        }

        seenTrackIds.add(t.id);
        if (primaryArtist) seenArtists.add(primaryArtist);
        result.push(t);

        if (result.length >= maxCount) break;
    }

    // If strict artist deduplication was too restrictive and yielded fewer than 10 tracks,
    // fill remainder from unseen tracks
    if (result.length < Math.min(10, tracks.length)) {
        for (const t of tracks) {
            if (!t || !t.id) continue;
            if (excludeIds && excludeIds.has(t.id)) continue;
            if (seenTrackIds.has(t.id)) continue;

            seenTrackIds.add(t.id);
            result.push(t);
            if (result.length >= maxCount) break;
        }
    }

    return result;
}

async function searchSingleQuery(
    q: string,
    limit: number,
    offset: number,
    accessToken: string,
    fetch: typeof globalThis.fetch
): Promise<any[] | 401 | 429> {
    // Spotify strictly caps search limit <= 10 for standard Web API apps
    const safeLimit = Math.min(10, Math.max(1, limit || 10));
    const safeOffset = Math.min(990, Math.max(0, Math.floor(offset || 0)));
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&market=US&limit=${safeLimit}&offset=${safeOffset}`;
    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(4000)
        });
        if (res.status === 401) return 401;
        if (res.status === 429) return 429;
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            console.error(`Spotify API error for "${q}" [status ${res.status}]: ${errText}`);
            return [];
        }
        const data = await res.json();
        const items = (data.tracks?.items || []).filter((t: any) => t && t.id);
        if (items.length === 0 && safeOffset > 0) {
            const fallbackUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&market=US&limit=${safeLimit}&offset=0`;
            const fbRes = await fetch(fallbackUrl, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                signal: AbortSignal.timeout(3000)
            });
            if (fbRes.ok) {
                const fbData = await fbRes.json();
                return (fbData.tracks?.items || []).filter((t: any) => t && t.id);
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
        // Multi-genre eclectic discovery mix across the global Spotify catalog:
        // Samples 6 distinct verified genre tags from any artist
        const allGenres = Object.keys(VERIFIED_GENRE_TAGS);
        const shuffledGenres = shuffleArray(allGenres);
        const tags1 = shuffledGenres.slice(0, 3).map((g) => {
            const tags = VERIFIED_GENRE_TAGS[g];
            return tags[Math.floor(Math.random() * tags.length)];
        });
        const tags2 = shuffledGenres.slice(3, 6).map((g) => {
            const tags = VERIFIED_GENRE_TAGS[g];
            return tags[Math.floor(Math.random() * tags.length)];
        });

        const q1 = tags1.map((tag) => `genre:"${tag}"`).join(' OR ');
        const q2 = tags2.map((tag) => `genre:"${tag}"`).join(' OR ');

        const offset1 = Math.floor(Math.random() * 20);
        const offset2 = Math.floor(Math.random() * 20);

        const batchResults = await Promise.all([
            searchSingleQuery(q1, 10, offset1, accessToken, fetch),
            searchSingleQuery(q2, 10, offset2, accessToken, fetch)
        ]);

        for (const res of batchResults) {
            if (res === 401 || res === 429) return res;
        }

        const candidatePool: any[] = [];
        for (const res of batchResults) {
            if (Array.isArray(res)) candidatePool.push(...res);
        }

        const finalTracks = deduplicateArtistsAndTracks(shuffleArray(candidatePool), excludeIds, 15);
        return finalTracks.map(toAppTrack);
    }

    if (slug === 'top-50') {
        const topGenres = ['pop', 'hip hop', 'reggaeton', 'contemporary r&b', 'dance pop'];
        const shuffledTop = shuffleArray(topGenres);
        const q1 = shuffledTop.slice(0, 2).map((t) => `genre:"${t}"`).join(' OR ');
        const q2 = shuffledTop.slice(2, 4).map((t) => `genre:"${t}"`).join(' OR ');

        const batchResults = await Promise.all([
            searchSingleQuery(q1, 10, 0, accessToken, fetch),
            searchSingleQuery(q2, 10, 0, accessToken, fetch)
        ]);

        for (const res of batchResults) {
            if (res === 401 || res === 429) return res;
        }

        const candidatePool: any[] = [];
        for (const res of batchResults) {
            if (Array.isArray(res)) candidatePool.push(...res);
        }

        const finalTracks = deduplicateArtistsAndTracks(shuffleArray(candidatePool), excludeIds, 15);
        return finalTracks.map(toAppTrack);
    }

    // Dynamic, verified genre discovery with NO artist whitelist:
    // Any artist tagged with this genre in Spotify's worldwide music index can appear.
    const genreTags = VERIFIED_GENRE_TAGS[slug] || [slug.replace(/-/g, ' ')];
    const shuffledTags = shuffleArray([...genreTags]);

    // Pick 2-3 verified subgenre tags to blend in this batch
    const tags1 = shuffledTags.slice(0, 2);
    const tags2 = shuffledTags.slice(2, 4);

    const q1 = tags1.map((tag) => `genre:"${tag}"`).join(' OR ');
    const q2 = tags2.length > 0
        ? tags2.map((tag) => `genre:"${tag}"`).join(' OR ')
        : `genre:"${tags1[0]}"`;

    // Vary offset across queries so each dig dives deeper into Spotify's catalog
    const offset1 = Math.floor(Math.random() * 25);
    const offset2 = Math.floor(Math.random() * 25);

    const batchResults = await Promise.all([
        searchSingleQuery(q1, 10, offset1, accessToken, fetch),
        searchSingleQuery(q2, 10, offset2, accessToken, fetch)
    ]);

    for (const res of batchResults) {
        if (res === 401 || res === 429) return res;
    }

    const candidatePool: any[] = [];
    for (const res of batchResults) {
        if (Array.isArray(res)) {
            candidatePool.push(...res);
        }
    }

    let finalTracks = deduplicateArtistsAndTracks(shuffleArray(candidatePool), excludeIds, 15);

    // If candidate pool was small or user has swiped many tracks, query the next subgenre tags
    if (finalTracks.length < 10 && shuffledTags.length > 4) {
        const tags3 = shuffledTags.slice(4, 6);
        const q3 = tags3.map((tag) => `genre:"${tag}"`).join(' OR ');
        const extraRes = await searchSingleQuery(q3, 10, 0, accessToken, fetch);
        if (Array.isArray(extraRes)) {
            candidatePool.push(...extraRes);
        }
        finalTracks = deduplicateArtistsAndTracks(shuffleArray(candidatePool), excludeIds, 15);
    }

    // Never dead-end: If still under 5 tracks (user swiped through entire genre), gracefully relax exclusion
    if (finalTracks.length < 5) {
        finalTracks = deduplicateArtistsAndTracks(shuffleArray(candidatePool), undefined, 15);
    }

    return finalTracks.map(toAppTrack);
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
    // If Spotify is currently rate-limited, skip network roundtrips and serve fallback instantly
    if (Date.now() < rateLimitedUntil) {
        return getFallbackTracksForGenre(slug, excludeIds);
    }

    let activeToken = token;
    if (!activeToken) {
        activeToken = await getClientCredentialsToken(fetch);
    }

    if (!activeToken) {
        return getFallbackTracksForGenre(slug, excludeIds);
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

    let result = await attempt();
    if (result === 401) {
        cookies.delete('spotify_access_token', { path: '/' });
        activeToken = await getClientCredentialsToken(fetch);
        if (activeToken) {
            result = await attempt();
        }
    }

    if (result === 429) {
        rateLimitedUntil = Date.now() + 60 * 1000;
        return getFallbackTracksForGenre(slug, excludeIds);
    }

    // Quick single retry if first attempt was empty
    if (Array.isArray(result) && result.length === 0 && token) {
        result = await attempt();
    }

    if (Array.isArray(result) && result.length > 0) {
        return result;
    }

    // Graceful offline/empty crate fallback: always return curated, high-quality on-genre tracks
    return getFallbackTracksForGenre(slug, excludeIds);
}
