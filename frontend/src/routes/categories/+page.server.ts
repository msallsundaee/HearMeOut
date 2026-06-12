import { env } from '$env/dynamic/private';

export async function load({ fetch }) {
    try {
        const res = await fetch(`${env.PAYLOAD_API_URL}/categories`);
        if (res.ok) {
            const data = await res.json();
            if (data.docs && data.docs.length > 0) {
                return { categories: data.docs };
            }
        }
    } catch (e) {
        console.error('Error fetching categories from Payload:', e);
    }
    
    // Fallback to mock data if no data in payload
    return {
        categories: [
            { id: 1, name: 'Pop Hits', slug: 'pop-hits', image: { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop' } },
            { id: 2, name: 'Indie Vibes', slug: 'indie-vibes', image: { url: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=600&auto=format&fit=crop' } },
            { id: 3, name: 'Workout', slug: 'workout', image: { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop' } },
            { id: 4, name: 'Chill & Relax', slug: 'chill', image: { url: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=600&auto=format&fit=crop' } }
        ]
    };
}
