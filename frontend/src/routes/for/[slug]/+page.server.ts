import { error } from '@sveltejs/kit';
import { getTracksWithRetry } from '$lib/server/spotify';
import { getCategoryBySlug } from '$lib/server/categories';
import { USE_CASES } from '$lib/config/useCases';

export async function load({ params, cookies, fetch, setHeaders }) {
	const useCase = USE_CASES[params.slug];
	if (!useCase) {
		throw error(404, 'Page Not Found');
	}

	setHeaders({
		'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
	});

	let token = cookies.get('spotify_access_token');
	let sampleTracks: any[] = [];

	try {
		const categoryPlaylistId = getCategoryBySlug(useCase.primaryGenre, fetch).then(
			(category) => category?.spotifyPlaylistId || undefined
		);

		const tracks = await getTracksWithRetry(
			useCase.primaryGenre,
			token,
			fetch,
			cookies,
			categoryPlaylistId
		);

		if (Array.isArray(tracks)) {
			sampleTracks = tracks.slice(0, 10);
		}
	} catch (e) {
		console.error('Error fetching useCase tracks in +page.server.ts:', e);
	}

	return {
		useCase,
		sampleTracks
	};
}
