import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
    cookies.delete('payload_token', { path: '/' });
    cookies.delete('spotify_access_token', { path: '/' });
    cookies.delete('spotify_refresh_token', { path: '/' });
    return json({ success: true });
}
