import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const SPOTIFY_CLIENT_ID = env.SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = env.SPOTIFY_REDIRECT_URI;

export async function GET({ url }) {
	if (!SPOTIFY_CLIENT_ID) {
		throw new Error('Missing SPOTIFY_CLIENT_ID');
	}

	const scope = 'user-library-modify user-library-read playlist-modify-public playlist-modify-private playlist-read-private user-read-private user-read-email';
	const state = Math.random().toString(36).substring(7);

	const redirect_uri = `${url.origin}/api/auth/callback`;

	const params = new URLSearchParams({
		response_type: 'code',
		client_id: SPOTIFY_CLIENT_ID,
		scope,
		redirect_uri: redirect_uri,
		state,
		show_dialog: 'true'
	});

	throw redirect(302, `https://accounts.spotify.com/authorize?${params.toString()}`);
}
