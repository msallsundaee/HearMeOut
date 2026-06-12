import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

const SPOTIFY_CLIENT_ID = env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = env.SPOTIFY_REDIRECT_URI;

export async function GET({ url, cookies }) {
	const code = url.searchParams.get('code') || null;
	const state = url.searchParams.get('state') || null;

	if (state === null) {
		throw redirect(302, '/?error=state_mismatch');
	}

	if (code) {
		const redirect_uri = `${url.origin}/api/auth/callback`;
		const authOptions = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
			},
			body: new URLSearchParams({
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			})
		};

		let success = false;
		try {
			const response = await fetch('https://accounts.spotify.com/api/token', authOptions);
			const data = await response.json();

			if (data.access_token) {
				cookies.set('spotify_access_token', data.access_token, {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					maxAge: data.expires_in
				});

				cookies.set('spotify_refresh_token', data.refresh_token, {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					maxAge: 60 * 60 * 24 * 30 // 30 days
				});

				success = true;
			}
		} catch (error) {
			console.error('Error during token exchange', error);
			throw redirect(302, '/?error=invalid_token');
		}
		
		if (success) {
			throw redirect(302, '/categories');
		}
	}

	throw redirect(302, '/');
}
