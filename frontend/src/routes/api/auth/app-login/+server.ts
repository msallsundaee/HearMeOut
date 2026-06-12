import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function POST({ request, cookies }) {
    const { email, password } = await request.json();
    
    try {
        const res = await fetch(`${env.PAYLOAD_API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok && data.token) {
            // Set session cookie
            cookies.set('payload_token', data.token, {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });
            return json({ success: true, user: data.user });
        } else {
            return json({ success: false, error: data.message || 'Login failed' }, { status: res.status });
        }
    } catch (e) {
        console.error('App login error', e);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
