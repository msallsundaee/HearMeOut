import { env } from '$env/dynamic/private';

export interface CategoryImage {
	url: string;
	sizes?: {
		card?: {
			url: string;
		};
	};
}

export interface Category {
	id: number | string;
	name: string;
	slug: string;
	image?: CategoryImage;
	spotifyPlaylistId?: string;
}

export const FALLBACK_CATEGORIES: Category[] = [
	{
		id: 11,
		name: 'Explore',
		slug: 'explore',
		image: {
			url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 12,
		name: 'OPM Hits',
		slug: 'opm',
		image: {
			url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 1,
		name: 'Pop Hits',
		slug: 'pop',
		image: {
			url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 2,
		name: 'Hip Hop / Rap',
		slug: 'hip-hop',
		image: {
			url: 'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 5,
		name: 'R&B Soul',
		slug: 'r-n-b',
		image: {
			url: 'https://plus.unsplash.com/premium_photo-1682124293900-54bea8ca7e9f?crop=entropy&cs=tinysrgb&fit=max&auto=format&q=80&w=600'
		}
	},
	{
		id: 3,
		name: 'Indie Vibes',
		slug: 'indie',
		image: {
			url: 'https://plus.unsplash.com/premium_photo-1682125768864-c80b650614f3?crop=entropy&cs=tinysrgb&fit=max&auto=format&q=80&w=600'
		}
	},
	{
		id: 4,
		name: 'Rock Classics',
		slug: 'rock',
		image: {
			url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 8,
		name: 'K-Pop',
		slug: 'k-pop',
		image: {
			url: 'https://plus.unsplash.com/premium_photo-1664474898608-7537d5780e17?crop=entropy&cs=tinysrgb&fit=max&auto=format&q=80&w=600'
		}
	},
	{
		id: 13,
		name: 'J-Pop & Anime',
		slug: 'j-pop',
		image: {
			url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 14,
		name: 'Latin Hits',
		slug: 'latin',
		image: {
			url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 15,
		name: 'Afrobeats',
		slug: 'afrobeats',
		image: {
			url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 6,
		name: 'Electronic / EDM',
		slug: 'electronic',
		image: {
			url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 7,
		name: 'Country Roads',
		slug: 'country',
		image: {
			url: 'https://plus.unsplash.com/premium_photo-1737392495642-0827bfb98660?crop=entropy&cs=tinysrgb&fit=max&auto=format&q=80&w=600'
		}
	},
	{
		id: 16,
		name: 'Jazz & Blues',
		slug: 'jazz',
		image: {
			url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 17,
		name: 'Lo-Fi Beats',
		slug: 'lo-fi',
		image: {
			url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 18,
		name: 'Metal & Heavy',
		slug: 'metal',
		image: {
			url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 19,
		name: 'Classical & Acoustic',
		slug: 'classical',
		image: {
			url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 9,
		name: 'Workout',
		slug: 'workout',
		image: {
			url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'
		}
	},
	{
		id: 10,
		name: 'Chill & Relax',
		slug: 'chill',
		image: {
			url: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=600&auto=format&fit=crop'
		}
	}
];

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const slugCache = new Map<string, { doc: any; expires: number }>();

let allCategoriesCache: Category[] | null = null;
let allCategoriesExpires = 0;

/**
 * Returns all active categories, cached in-memory and falling back to predefined genres
 * when Payload is offline.
 */
export async function getAllCategories(fetch: typeof globalThis.fetch): Promise<Category[]> {
	if (allCategoriesCache && Date.now() < allCategoriesExpires) {
		return allCategoriesCache;
	}

	if (!env.PAYLOAD_API_URL) {
		return FALLBACK_CATEGORIES;
	}

	try {
		const res = await fetch(`${env.PAYLOAD_API_URL}/categories`, {
			signal: AbortSignal.timeout(700)
		});
		if (res.ok) {
			const data = await res.json();
			if (data.docs && data.docs.length > 0) {
				const backendOrigin = new URL(env.PAYLOAD_API_URL).origin;
				const toAbsolute = (url: string) => (url.startsWith('/') ? `${backendOrigin}${url}` : url);
				const categories = data.docs.map((cat: any) => {
					if (cat.image?.url) {
						const cardUrl = cat.image.sizes?.card?.url;
						cat.image.url = toAbsolute(cardUrl || cat.image.url);
					}
					return cat;
				});
				allCategoriesCache = categories;
				allCategoriesExpires = Date.now() + CACHE_TTL_MS;
				return categories;
			}
		}
	} catch {
		// Backend offline/slow: cache fallback for 2 mins so subsequent clicks are instantaneous
		allCategoriesCache = FALLBACK_CATEGORIES;
		allCategoriesExpires = Date.now() + 2 * 60 * 1000;
	}

	return FALLBACK_CATEGORIES;
}

/**
 * Looks up a category's Payload record by slug — specifically for its
 * spotifyPlaylistId, so discovery can pull from a curated playlist instead
 * of a loose genre-keyword search.
 *
 * Uses a tight AbortSignal timeout (700ms) with failure caching so slow or sleeping
 * backend cold-starts never stall navigation.
 */
export async function getCategoryBySlug(slug: string, fetch: typeof globalThis.fetch) {
	const normalizedSlug = slug === 'discover' ? 'explore' : slug;
	const cached = slugCache.get(normalizedSlug);
	if (cached && Date.now() < cached.expires) {
		return cached.doc;
	}

	const fallbackDoc = FALLBACK_CATEGORIES.find((c) => c.slug === normalizedSlug) ?? null;

	if (!env.PAYLOAD_API_URL) {
		return fallbackDoc;
	}

	try {
		const url = `${env.PAYLOAD_API_URL}/categories?where[slug][equals]=${encodeURIComponent(normalizedSlug)}&limit=1`;
		const res = await fetch(url, {
			signal: AbortSignal.timeout(700)
		});
		if (!res.ok) {
			slugCache.set(normalizedSlug, { doc: fallbackDoc, expires: Date.now() + 2 * 60 * 1000 });
			return fallbackDoc;
		}
		const data = await res.json();
		const doc = data.docs?.[0] ?? fallbackDoc;
		slugCache.set(normalizedSlug, { doc, expires: Date.now() + CACHE_TTL_MS });
		return doc;
	} catch {
		// Silently fallback without blocking SSR and cache for 2 mins to prevent repetitive stalls
		slugCache.set(normalizedSlug, { doc: fallbackDoc, expires: Date.now() + 2 * 60 * 1000 });
		return fallbackDoc;
	}
}

/**
 * Returns a clean, human-readable display title for any category slug.
 */
export function formatCategoryTitle(slug: string): string {
	const normalized = slug === 'discover' ? 'explore' : slug;
	const match = FALLBACK_CATEGORIES.find((c) => c.slug === normalized);
	if (match) return match.name;

	const titleMap: Record<string, string> = {
		'explore': 'Explore',
		'opm': 'OPM Hits',
		'k-pop': 'K-Pop',
		'j-pop': 'J-Pop & Anime',
		'r-n-b': 'R&B Soul',
		'lo-fi': 'Lo-Fi Beats',
		'hip-hop': 'Hip Hop / Rap',
		'top-50': 'Top 50 Hits'
	};

	if (titleMap[normalized]) return titleMap[normalized];

	return normalized
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

