import { env } from '$env/dynamic/public';

export const siteConfig = {
	name: 'HearMeOut',
	shortName: 'HearMeOut',
	tagline: 'Find Songs for Stories & Discover Fresh Music',
	description:
		'Find the perfect songs for your Instagram stories, reels, TikToks, and playlists. Swipe right on 30-second audio previews, audition aesthetic tracks, and seamlessly sync your favorites to Spotify.',
	url: env.PUBLIC_SITE_URL || 'https://hearme-out.vercel.app',
	ogImage: '/og-image.jpg',
	creator: 'Bea Clarise',
	twitterHandle: '@HearMeOutApp',
	themeColor: '#000000',
	keywords: [
		'songs for instagram stories',
		'songs for reels',
		'photo dump songs',
		'find songs for stories',
		'aesthetic song finder',
		'music for instagram posts',
		'30 second music preview',
		'music discovery',
		'swipe music',
		'tinder for music',
		'spotify preview',
		'discover new songs',
		'songs for tiktok',
		'song recommender',
		'spotify playlist sync',
		'aesthetic music discovery',
		'hearmeout'
	]
};

/**
 * Returns a normalized canonical URL with trailing slashes trimmed.
 */
export function getCanonicalUrl(pathname: string = ''): string {
	const base = siteConfig.url.replace(/\/+$/, '');
	const path = pathname.replace(/^\/+/, '');
	return path ? `${base}/${path}` : base;
}

/**
 * Ensures an image URL is fully qualified with origin (required by OpenGraph/Twitter scrapers).
 */
export function getAbsoluteImageUrl(imagePath?: string): string {
	if (!imagePath) {
		return `${siteConfig.url.replace(/\/+$/, '')}${siteConfig.ogImage}`;
	}
	if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
		return imagePath;
	}
	const base = siteConfig.url.replace(/\/+$/, '');
	const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
	return `${base}${path}`;
}
