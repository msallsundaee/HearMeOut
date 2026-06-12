import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
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
