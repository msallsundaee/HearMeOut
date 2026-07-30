import { fetchAlbumCovers } from '$lib/server/spotify';

export async function load({ fetch }) {
    // fetchAlbumCovers keeps its own hour-long cache, so this is cheap on repeat
    // visits. No response caching here: the layout varies this page by auth cookie.
    return { covers: await fetchAlbumCovers(fetch) };
}
