import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
    // Transparently auto-refresh Spotify access token when expired but refresh token exists
    const accessToken = event.cookies.get('spotify_access_token');
    const refreshToken = event.cookies.get('spotify_refresh_token');

    if (!accessToken && refreshToken && env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET) {
        try {
            const basicAuth = Buffer.from(
                `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
            ).toString('base64');

            const tokenRes = await event.fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${basicAuth}`
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                }),
                signal: AbortSignal.timeout(3000)
            });

            if (tokenRes.ok) {
                const tokenData = await tokenRes.json();
                if (tokenData.access_token) {
                    event.cookies.set('spotify_access_token', tokenData.access_token, {
                        path: '/',
                        httpOnly: true,
                        secure: !dev,
                        sameSite: 'lax',
                        maxAge: tokenData.expires_in || 3600
                    });

                    if (tokenData.refresh_token) {
                        event.cookies.set('spotify_refresh_token', tokenData.refresh_token, {
                            path: '/',
                            httpOnly: true,
                            secure: !dev,
                            sameSite: 'lax',
                            maxAge: 60 * 60 * 24 * 30 // 30 days
                        });
                    }
                }
            } else if (tokenRes.status === 400 || tokenRes.status === 401) {
                // Refresh token expired or revoked in Spotify dashboard
                event.cookies.delete('spotify_access_token', { path: '/' });
                event.cookies.delete('spotify_refresh_token', { path: '/' });
            }
        } catch (e) {
            console.error('Spotify token auto-refresh error:', e);
        }
    }

    const response = await resolve(event);

    // Enforce strict security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Enforce HTTPS
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Basic CSP (Content Security Policy)
    // Note: In development SvelteKit uses inline scripts.
    // This allows scripts from self, and images from anywhere (since we use unsplash/spotify images).
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' https: data:; media-src 'self' https: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https: wss:;"
    );

    return response;
};
