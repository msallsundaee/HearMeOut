import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function POST({ request, cookies, fetch }) {
    const { email, password, name } = await request.json();
    
    try {
        const res = await fetch(`${env.PAYLOAD_API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        
        const data = await res.json();
        
        if (res.ok && data.doc) {
            // Automatically log them in
            const loginRes = await fetch('/api/auth/app-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();
            return json(loginData);
        } else {
            return json({ success: false, error: data.errors?.[0]?.message || 'Registration failed' }, { status: res.status });
        }
    } catch (e) {
        console.error('App register error', e);
        return json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
