import { env } from '$env/dynamic/public';

export const siteConfig = {
	name: 'HearMeOut',
	shortName: 'HearMeOut',
	tagline: 'Swipe & Discover New Music',
	description:
		'Stop scrolling endless playlists. Discover fresh music by swiping right on 30-second audio previews, and seamlessly sync your favorite tracks to Spotify.',
	url: env.PUBLIC_SITE_URL || 'https://hearme-out.vercel.app',
	ogImage: '/og-image.jpg',
	creator: 'Bea Clarise',
	twitterHandle: '@HearMeOutApp',
	themeColor: '#000000',
	keywords: [
		'music discovery',
		'swipe music',
		'tinder for music',
		'spotify preview',
		'30 second music preview',
		'discover new songs',
		'song recommender',
		'music streaming',
		'spotify playlist sync',
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
