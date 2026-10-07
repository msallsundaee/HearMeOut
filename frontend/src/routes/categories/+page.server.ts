import { getAllCategories } from '$lib/server/categories';

export async function load({ fetch, setHeaders }) {
	// Enable CDN / edge caching so production serves this in milliseconds
	setHeaders({
		'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400'
	});

	const categories = await getAllCategories(fetch);
	return { categories };
}
