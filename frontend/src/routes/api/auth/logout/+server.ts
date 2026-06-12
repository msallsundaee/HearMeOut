import { json } from '@sveltejs/kit';

export async function POST({ cookies }) {
    // Delete payload_token
    cookies.delete('payload_token', { path: '/' });
    return json({ success: true });
}
