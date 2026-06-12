export async function load({ params, cookies }) {
    const token = cookies.get('spotify_access_token');
    
    // In a real app we'd redirect to login if no token.
    // if (!token) throw redirect(302, '/');

    // Mock track data for demonstration purposes
    const tracks = [
        {
            id: '3',
            spotifyId: 'track3',
            title: 'Watermelon Sugar',
            artist: 'Harry Styles',
            albumArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=800&auto=format&fit=crop',
            previewUrl: ''
        },
        {
            id: '2',
            spotifyId: 'track2',
            title: 'Levitating',
            artist: 'Dua Lipa',
            albumArt: 'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?q=80&w=800&auto=format&fit=crop',
            previewUrl: ''
        },
        {
            id: '1',
            spotifyId: 'track1',
            title: 'Blinding Lights',
            artist: 'The Weeknd',
            albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
            previewUrl: 'https://p.scdn.co/mp3-preview/b6c50b69106be896f634125b03517c8801ce4371?cid=774b29d4f13844c495f206cafdad9c86'
        }
    ];

    return {
        categorySlug: params.slug,
        tracks
    };
}
