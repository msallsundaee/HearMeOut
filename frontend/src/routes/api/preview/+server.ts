import { json } from '@sveltejs/kit';

const ITUNES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (iTunes preview links never expire)
const DEEZER_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes (Deezer links carry short-lived CDN tokens)
const MISS_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes for misses

const cache = new Map<string, { url: string; expires: number; source: 'itunes' | 'deezer' }>();

/**
 * Cleans Spotify track titles by stripping common suffixes that confuse
 * search engines (e.g. "(feat. ...)", "- Remastered", "(2011 Remaster)", etc.)
 */
function cleanTitle(raw: string): string {
	return raw
		.replace(
			/\s*[\(\[](?:feat\.|feat|featuring|with|remastered|remaster|deluxe|version|live|radio edit|explicit|mono|stereo|bonus track|from the|soundtrack|anniversary|taylor's version|\d{4}\s*remaster)[^\)\]]*[\)\]]/gi,
			''
		)
		.replace(
			/\s*-\s*(?:remastered|remaster|live|radio edit|deluxe|explicit|single version|album version|bonus track|instrumental|\d{4}\s*remaster).*$/gi,
			''
		)
		.replace(/["'’]/g, '')
		.trim();
}

/**
 * Extracts the primary artist from a comma/semicolon/slash-separated list.
 */
function getPrimaryArtist(raw: string): string {
	return raw.split(/[,;&/]/)[0].trim();
}

/**
 * Normalizes text for fuzzy token matching.
 */
function normalize(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Validates that candidate result from iTunes or Deezer actually matches the
 * expected song and artist, preventing completely wrong audio from being played.
 */
function isAcceptableMatch(
	candTitle: string,
	candArtist: string,
	targetTitle: string,
	targetArtist: string
): boolean {
	const normCandTitle = normalize(candTitle);
	const normCandArtist = normalize(candArtist);
	const normTargetTitle = normalize(targetTitle);
	const normTargetArtist = normalize(targetArtist);

	if (!normCandTitle || !normCandArtist) return false;

	// 1. Strict Artist Check: candidate artist and target artist must share at least
	// one significant token or be substrings of one another.
	const targetArtistTokens = normTargetArtist.split(' ').filter((w) => w.length > 1);
	const candArtistTokens = normCandArtist.split(' ').filter((w) => w.length > 1);

	const artistMatches =
		normCandArtist.includes(normTargetArtist) ||
		normTargetArtist.includes(normCandArtist) ||
		targetArtistTokens.some((t) => candArtistTokens.includes(t));

	if (!artistMatches) {
		return false;
	}

	// 2. Title Check: at least one significant title token must overlap or substrings match.
	const targetTitleTokens = normTargetTitle.split(' ').filter((w) => w.length > 1);
	const candTitleTokens = normCandTitle.split(' ').filter((w) => w.length > 1);

	const titleMatches =
		normCandTitle.includes(normTargetTitle) ||
		normTargetTitle.includes(normCandTitle) ||
		targetTitleTokens.some((t) => candTitleTokens.includes(t));

	return titleMatches;
}

/**
 * Searches Apple iTunes for a 30-second audio preview, validating the result.
 */
async function searchITunes(
	query: string,
	targetTitle: string,
	targetArtist: string,
	fetch: typeof globalThis.fetch
): Promise<string> {
	try {
		const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`;
		const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
		if (res.ok) {
			const data = await res.json();
			const results = data?.results || [];
			for (const r of results) {
				if (!r.previewUrl) continue;
				if (isAcceptableMatch(r.trackName || '', r.artistName || '', targetTitle, targetArtist)) {
					return r.previewUrl;
				}
			}
		}
	} catch {
		// Fallback
	}
	return '';
}

/**
 * Searches Deezer for a 30-second audio preview as a secondary provider, validating the result.
 */
async function searchDeezer(
	query: string,
	targetTitle: string,
	targetArtist: string,
	fetch: typeof globalThis.fetch
): Promise<string> {
	try {
		const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`;
		const res = await fetch(url, { signal: AbortSignal.timeout(1800) });
		if (res.ok) {
			const data = await res.json();
			const results = data?.data || [];
			for (const d of results) {
				if (!d.preview) continue;
				if (isAcceptableMatch(d.title || '', d.artist?.name || '', targetTitle, targetArtist)) {
					return d.preview;
				}
			}
		}
	} catch {
		// Fallback
	}
	return '';
}

/**
 * Resolves a 30s preview URL for a track on demand with strict validation.
 */
export async function GET({ url, fetch, setHeaders }) {
	const rawTitle = url.searchParams.get('title') || '';
	const rawArtist = url.searchParams.get('artist') || '';
	const bypassCache = url.searchParams.get('fresh') === '1';

	if (!rawTitle || !rawArtist) {
		return json({ previewUrl: '' });
	}

	const key = `${rawTitle}::${rawArtist}`.toLowerCase();
	const cached = cache.get(key);

	if (!bypassCache && cached && Date.now() < cached.expires) {
		const maxAge = cached.source === 'itunes' ? 86400 : 1800;
		setHeaders({
			'cache-control': `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=86400`
		});
		return json({ previewUrl: cached.url });
	}

	const cleaned = cleanTitle(rawTitle);
	const primaryArtist = getPrimaryArtist(rawArtist);

	// Queries to test in sequence — ALWAYS include artist to prevent false matches
	const queries = [
		`${cleaned || rawTitle} ${primaryArtist}`.trim(),
		`${rawTitle} ${rawArtist}`.trim()
	];
	if (primaryArtist !== rawArtist) {
		queries.push(`${cleaned || rawTitle} ${rawArtist}`.trim());
	}
	const uniqueQueries = Array.from(new Set(queries.filter(Boolean)));

	// 1. Try iTunes first across query variations with artist validation
	const iTunesResults = await Promise.all(
		uniqueQueries.map((q) => searchITunes(q, cleaned || rawTitle, primaryArtist, fetch))
	);
	let previewUrl = iTunesResults.find(Boolean) || '';
	let source: 'itunes' | 'deezer' = 'itunes';

	// 2. If iTunes doesn't have it, try Deezer with artist validation
	if (!previewUrl) {
		const deezerResults = await Promise.all(
			uniqueQueries.map((q) => searchDeezer(q, cleaned || rawTitle, primaryArtist, fetch))
		);
		previewUrl = deezerResults.find(Boolean) || '';
		source = 'deezer';
	}

	// Set cache lifetimes
	const ttl = previewUrl
		? source === 'itunes'
			? ITUNES_CACHE_TTL_MS
			: DEEZER_CACHE_TTL_MS
		: MISS_CACHE_TTL_MS;

	cache.set(key, { url: previewUrl, expires: Date.now() + ttl, source });

	const clientMaxAge = previewUrl ? (source === 'itunes' ? 86400 : 1800) : 180;
	setHeaders({
		'cache-control': `public, max-age=${clientMaxAge}, s-maxage=${clientMaxAge}, stale-while-revalidate=86400`
	});

	return json({ previewUrl, source: previewUrl ? source : null });
}
