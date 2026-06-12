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
            { id: 11, name: 'Discover', slug: 'discover', image: { url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop' } },
            { id: 1, name: 'Pop Hits', slug: 'pop', image: { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop' } },
            { id: 2, name: 'Hip Hop / Rap', slug: 'hip-hop', image: { url: 'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=600&auto=format&fit=crop' } },
            { id: 3, name: 'Indie Vibes', slug: 'indie', image: { url: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=600&auto=format&fit=crop' } },
            { id: 4, name: 'Rock Classics', slug: 'rock', image: { url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop' } },
            { id: 5, name: 'R&B Soul', slug: 'r-n-b', image: { url: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=600&auto=format&fit=crop' } },
            { id: 6, name: 'Electronic / EDM', slug: 'electronic', image: { url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop' } },
            { id: 7, name: 'Country Roads', slug: 'country', image: { url: 'https://images.unsplash.com/photo-1483010168383-c4083a2162dd?q=80&w=600&auto=format&fit=crop' } },
            { id: 8, name: 'K-Pop', slug: 'k-pop', image: { url: 'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?q=80&w=600&auto=format&fit=crop' } },
            { id: 9, name: 'Workout', slug: 'workout', image: { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop' } },
            { id: 10, name: 'Chill & Relax', slug: 'chill', image: { url: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=600&auto=format&fit=crop' } }
        ]
    };
}
