export interface FallbackTrack {
    id: string;
    spotifyId: string;
    title: string;
    artist: string;
    albumArt: string;
    previewUrl: string;
    duration_ms: number;
    explicit: boolean;
}

export const FALLBACK_TRACKS_BY_GENRE: Record<string, FallbackTrack[]> = {
    'opm': [
        {
            id: 'opm-1',
            spotifyId: '5Z0AM4LWkEFQZq7LgZ5g2w',
            title: 'Kathang Isip',
            artist: 'Ben&Ben',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 318000,
            explicit: false
        },
        {
            id: 'opm-2',
            spotifyId: '6U3uc086vXnOQy5vU6s1Xn',
            title: 'Ang Huling El Bimbo',
            artist: 'Eraserheads',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 447000,
            explicit: false
        },
        {
            id: 'opm-3',
            spotifyId: '3U4isOIWM3VvDubwSI3y7a',
            title: 'Raining In Manila',
            artist: 'Lola Amour',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 290000,
            explicit: false
        },
        {
            id: 'opm-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6wp',
            title: 'Uhaw (Tayong Lahat)',
            artist: 'Dilaw',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 241000,
            explicit: false
        },
        {
            id: 'opm-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbdwr',
            title: 'Give Me Your Forever',
            artist: 'Zack Tabudlo',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 244000,
            explicit: false
        },
        {
            id: 'opm-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwH',
            title: 'Leaves',
            artist: 'Ben&Ben',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 311000,
            explicit: false
        },
        {
            id: 'opm-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xk',
            title: 'With A Smile',
            artist: 'Eraserheads',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 263000,
            explicit: false
        },
        {
            id: 'opm-8',
            spotifyId: '4HlFJVsn89799tWlg879ds',
            title: 'Mundo',
            artist: 'IV of Spades',
            albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 349000,
            explicit: false
        },
        {
            id: 'opm-9',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e4r',
            title: 'Kisapmata',
            artist: 'Rivermaya',
            albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 281000,
            explicit: false
        },
        {
            id: 'opm-10',
            spotifyId: '6Xg3g1m0Z5g2w3e4r5t6y7',
            title: 'Pasilyo',
            artist: 'SunKissed Lola',
            albumArt: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 270000,
            explicit: false
        }
    ],
    'pop': [
        {
            id: 'pop-1',
            spotifyId: '4Dvkj6JhhA12EX05QKi79Z',
            title: 'Levitating',
            artist: 'Dua Lipa',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 203000,
            explicit: false
        },
        {
            id: 'pop-2',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9b1',
            title: 'bad guy',
            artist: 'Billie Eilish',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 194000,
            explicit: false
        },
        {
            id: 'pop-3',
            spotifyId: '3U4isOIWM3VvDubwSI3y7b',
            title: 'vampire',
            artist: 'Olivia Rodrigo',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 219000,
            explicit: true
        },
        {
            id: 'pop-4',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xl',
            title: 'Espresso',
            artist: 'Sabrina Carpenter',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 175000,
            explicit: false
        },
        {
            id: 'pop-5',
            spotifyId: '0pqnGHJpmpxLKifKR2L6wq',
            title: 'Blinding Lights',
            artist: 'The Weeknd',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 200000,
            explicit: false
        },
        {
            id: 'pop-6',
            spotifyId: '1BxfuPKGuaTgP7aM0fbdws',
            title: 'As It Was',
            artist: 'Harry Styles',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 167000,
            explicit: false
        },
        {
            id: 'pop-7',
            spotifyId: '77d29hR3r5BqXyR02V6XwI',
            title: 'Cruel Summer',
            artist: 'Taylor Swift',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 178000,
            explicit: false
        },
        {
            id: 'pop-8',
            spotifyId: '4HlFJVsn89799tWlg879dt',
            title: 'That\'s What I Like',
            artist: 'Bruno Mars',
            albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 206000,
            explicit: false
        }
    ],
    'indie': [
        {
            id: 'indie-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9b3',
            title: 'The Less I Know The Better',
            artist: 'Tame Impala',
            albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 216000,
            explicit: true
        },
        {
            id: 'indie-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7c',
            title: 'Sofia',
            artist: 'Clairo',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 188000,
            explicit: false
        },
        {
            id: 'indie-3',
            spotifyId: '4HlFJVsn89799tWlg879du',
            title: 'Chamber of Reflection',
            artist: 'Mac DeMarco',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 231000,
            explicit: false
        },
        {
            id: 'indie-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6wr',
            title: 'Kyoto',
            artist: 'Phoebe Bridgers',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 184000,
            explicit: true
        },
        {
            id: 'indie-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbdwt',
            title: 'Show Me How',
            artist: 'Men I Trust',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 215000,
            explicit: false
        },
        {
            id: 'indie-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwJ',
            title: 'Sunflower',
            artist: 'Rex Orange County',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 251000,
            explicit: false
        },
        {
            id: 'indie-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xm',
            title: 'Glue Song',
            artist: 'beabadoobee',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 135000,
            explicit: false
        },
        {
            id: 'indie-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e4s',
            title: 'Everytime',
            artist: 'boy pablo',
            albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 182000,
            explicit: false
        }
    ],
    'rock': [
        {
            id: 'rock-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9b4',
            title: 'Bohemian Rhapsody',
            artist: 'Queen',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 354000,
            explicit: false
        },
        {
            id: 'rock-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7d',
            title: 'Smells Like Teen Spirit',
            artist: 'Nirvana',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 301000,
            explicit: false
        },
        {
            id: 'rock-3',
            spotifyId: '4HlFJVsn89799tWlg879dv',
            title: 'Do I Wanna Know?',
            artist: 'Arctic Monkeys',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 272000,
            explicit: false
        },
        {
            id: 'rock-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6ws',
            title: 'Last Nite',
            artist: 'The Strokes',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 193000,
            explicit: false
        },
        {
            id: 'rock-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbdwu',
            title: 'Everlong',
            artist: 'Foo Fighters',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 250000,
            explicit: false
        },
        {
            id: 'rock-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwK',
            title: 'Mr. Brightside',
            artist: 'The Killers',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 222000,
            explicit: false
        },
        {
            id: 'rock-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xn',
            title: 'Creep',
            artist: 'Radiohead',
            albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 238000,
            explicit: true
        },
        {
            id: 'rock-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e4t',
            title: 'Californication',
            artist: 'Red Hot Chili Peppers',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 321000,
            explicit: false
        }
    ],
    'r-n-b': [
        {
            id: 'rnb-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9b5',
            title: 'Kill Bill',
            artist: 'SZA',
            albumArt: 'https://plus.unsplash.com/premium_photo-1682124293900-54bea8ca7e9f?crop=entropy&cs=tinysrgb&fit=max&auto=format&q=80&w=600',
            previewUrl: '',
            duration_ms: 153000,
            explicit: true
        },
        {
            id: 'rnb-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7e',
            title: 'Thinkin Bout You',
            artist: 'Frank Ocean',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 200000,
            explicit: false
        },
        {
            id: 'rnb-3',
            spotifyId: '4HlFJVsn89799tWlg879dw',
            title: 'Best Part',
            artist: 'Daniel Caesar, H.E.R.',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 209000,
            explicit: false
        },
        {
            id: 'rnb-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6wt',
            title: 'Heartbreak Anniversary',
            artist: 'Giveon',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 198000,
            explicit: false
        },
        {
            id: 'rnb-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbdwv',
            title: 'Trust',
            artist: 'Brent Faiyaz',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 181000,
            explicit: true
        },
        {
            id: 'rnb-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwL',
            title: 'Playing Games',
            artist: 'Summer Walker',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 143000,
            explicit: true
        },
        {
            id: 'rnb-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xo',
            title: 'Texas Sun',
            artist: 'Leon Bridges, Khruangbin',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 252000,
            explicit: false
        },
        {
            id: 'rnb-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e4u',
            title: 'Doo Wop (That Thing)',
            artist: 'Lauryn Hill',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 320000,
            explicit: false
        }
    ],
    'hip-hop': [
        {
            id: 'hiphop-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9b6',
            title: 'HUMBLE.',
            artist: 'Kendrick Lamar',
            albumArt: 'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 177000,
            explicit: true
        },
        {
            id: 'hiphop-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7f',
            title: 'No Role Modelz',
            artist: 'J. Cole',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 292000,
            explicit: true
        },
        {
            id: 'hiphop-3',
            spotifyId: '4HlFJVsn89799tWlg879dx',
            title: 'SICKO MODE',
            artist: 'Travis Scott',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 312000,
            explicit: true
        },
        {
            id: 'hiphop-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6wu',
            title: 'God\'s Plan',
            artist: 'Drake',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 198000,
            explicit: true
        },
        {
            id: 'hiphop-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbdww',
            title: 'Praise The Lord (Da Shine)',
            artist: 'A$AP Rocky, Skepta',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 205000,
            explicit: true
        },
        {
            id: 'hiphop-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwM',
            title: 'EARFQUAKE',
            artist: 'Tyler, The Creator',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 190000,
            explicit: true
        },
        {
            id: 'hiphop-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xp',
            title: 'Bank Account',
            artist: '21 Savage',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 220000,
            explicit: true
        },
        {
            id: 'hiphop-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e4v',
            title: 'Creepin\'',
            artist: 'Metro Boomin, The Weeknd, 21 Savage',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 221000,
            explicit: true
        }
    ],
    'jazz': [
        {
            id: 'jazz-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9b7',
            title: 'So What',
            artist: 'Miles Davis',
            albumArt: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 562000,
            explicit: false
        },
        {
            id: 'jazz-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7g',
            title: 'From The Start',
            artist: 'Laufey',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 169000,
            explicit: false
        },
        {
            id: 'jazz-3',
            spotifyId: '4HlFJVsn89799tWlg879dy',
            title: 'Don\'t Know Why',
            artist: 'Norah Jones',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 185000,
            explicit: false
        },
        {
            id: 'jazz-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6wv',
            title: 'Take Five',
            artist: 'Dave Brubeck',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 324000,
            explicit: false
        },
        {
            id: 'jazz-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbdwx',
            title: 'Giant Steps',
            artist: 'John Coltrane',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 283000,
            explicit: false
        },
        {
            id: 'jazz-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwN',
            title: 'I Fall in Love Too Easily',
            artist: 'Chet Baker',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 200000,
            explicit: false
        },
        {
            id: 'jazz-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xq',
            title: 'Peace Piece',
            artist: 'Bill Evans',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 402000,
            explicit: false
        },
        {
            id: 'jazz-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e4w',
            title: 'Take the A Train',
            artist: 'Duke Ellington',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 173000,
            explicit: false
        }
    ],
    'metal': [
        {
            id: 'metal-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9b8',
            title: 'Enter Sandman',
            artist: 'Metallica',
            albumArt: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 331000,
            explicit: false
        },
        {
            id: 'metal-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7h',
            title: 'Chop Suey!',
            artist: 'System Of A Down',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 210000,
            explicit: false
        },
        {
            id: 'metal-3',
            spotifyId: '4HlFJVsn89799tWlg879dz',
            title: 'Duality',
            artist: 'Slipknot',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 252000,
            explicit: true
        },
        {
            id: 'metal-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6ww',
            title: 'Hail to the King',
            artist: 'Avenged Sevenfold',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 305000,
            explicit: false
        },
        {
            id: 'metal-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbdwy',
            title: 'The Trooper',
            artist: 'Iron Maiden',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 251000,
            explicit: false
        },
        {
            id: 'metal-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwO',
            title: 'Symphony of Destruction',
            artist: 'Megadeth',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 242000,
            explicit: false
        },
        {
            id: 'metal-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xr',
            title: 'Stranded',
            artist: 'Gojira',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 269000,
            explicit: false
        },
        {
            id: 'metal-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e4x',
            title: 'Change (In the House of Flies)',
            artist: 'Deftones',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 299000,
            explicit: false
        }
    ],
    'classical': [
        {
            id: 'class-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9b9',
            title: 'Moonlight Sonata',
            artist: 'Ludwig van Beethoven',
            albumArt: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 360000,
            explicit: false
        },
        {
            id: 'class-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7i',
            title: 'Clair de Lune',
            artist: 'Claude Debussy',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 300000,
            explicit: false
        },
        {
            id: 'class-3',
            spotifyId: '4HlFJVsn89799tWlg879ea',
            title: 'Eine kleine Nachtmusik',
            artist: 'Wolfgang Amadeus Mozart',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 348000,
            explicit: false
        },
        {
            id: 'class-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6wx',
            title: 'Nocturne in E-Flat Major',
            artist: 'Frédéric Chopin',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 268000,
            explicit: false
        },
        {
            id: 'class-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbdwz',
            title: 'Spring (The Four Seasons)',
            artist: 'Antonio Vivaldi',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 204000,
            explicit: false
        },
        {
            id: 'class-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwP',
            title: 'Air on the G String',
            artist: 'Johann Sebastian Bach',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 310000,
            explicit: false
        },
        {
            id: 'class-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xs',
            title: 'Swan Lake, Op. 20',
            artist: 'Pyotr Ilyich Tchaikovsky',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 180000,
            explicit: false
        },
        {
            id: 'class-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e4y',
            title: 'Nuvole Bianche',
            artist: 'Ludovico Einaudi',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 357000,
            explicit: false
        }
    ],
    'k-pop': [
        {
            id: 'kpop-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9ba',
            title: 'Hype Boy',
            artist: 'NewJeans',
            albumArt: 'https://plus.unsplash.com/premium_photo-1664474898608-7537d5780e17?crop=entropy&cs=tinysrgb&fit=max&auto=format&q=80&w=600',
            previewUrl: '',
            duration_ms: 179000,
            explicit: false
        },
        {
            id: 'kpop-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7j',
            title: 'Dynamite',
            artist: 'BTS',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 199000,
            explicit: false
        },
        {
            id: 'kpop-3',
            spotifyId: '4HlFJVsn89799tWlg879eb',
            title: 'How You Like That',
            artist: 'BLACKPINK',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 182000,
            explicit: false
        },
        {
            id: 'kpop-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6wy',
            title: 'Supernova',
            artist: 'aespa',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 178000,
            explicit: false
        },
        {
            id: 'kpop-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbe00',
            title: 'LOVE DIVE',
            artist: 'IVE',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 177000,
            explicit: false
        },
        {
            id: 'kpop-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwQ',
            title: 'ANTIFRAGILE',
            artist: 'LE SSERAFIM',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 184000,
            explicit: false
        },
        {
            id: 'kpop-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xt',
            title: 'FANCY',
            artist: 'TWICE',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 215000,
            explicit: false
        },
        {
            id: 'kpop-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e4z',
            title: 'God\'s Menu',
            artist: 'Stray Kids',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 168000,
            explicit: false
        }
    ],
    'j-pop': [
        {
            id: 'jpop-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9bb',
            title: 'Yoru ni Kakeru',
            artist: 'YOASOBI',
            albumArt: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 261000,
            explicit: false
        },
        {
            id: 'jpop-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7k',
            title: 'Shinunoga E-Wa',
            artist: 'Fujii Kaze',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 185000,
            explicit: false
        },
        {
            id: 'jpop-3',
            spotifyId: '4HlFJVsn89799tWlg879ec',
            title: 'Lemon',
            artist: 'Kenshi Yonezu',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 255000,
            explicit: false
        },
        {
            id: 'jpop-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6wz',
            title: 'Usseewa',
            artist: 'Ado',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 204000,
            explicit: false
        },
        {
            id: 'jpop-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbe01',
            title: 'Zenzenzense',
            artist: 'RADWIMPS',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 285000,
            explicit: false
        },
        {
            id: 'jpop-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwR',
            title: 'Hakujitsu',
            artist: 'King Gnu',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 279000,
            explicit: false
        },
        {
            id: 'jpop-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xu',
            title: 'Stay With Me',
            artist: 'Miki Matsubara',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 304000,
            explicit: false
        },
        {
            id: 'jpop-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e50',
            title: 'Pretender',
            artist: 'Official HIGE DANDism',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 326000,
            explicit: false
        }
    ],
    'latin': [
        {
            id: 'latin-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9bc',
            title: 'Tití Me Preguntó',
            artist: 'Bad Bunny',
            albumArt: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 243000,
            explicit: true
        },
        {
            id: 'latin-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7l',
            title: 'DESPECHÁ',
            artist: 'ROSALÍA',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 157000,
            explicit: false
        },
        {
            id: 'latin-3',
            spotifyId: '4HlFJVsn89799tWlg879ed',
            title: 'PROVENZA',
            artist: 'KAROL G',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 210000,
            explicit: false
        },
        {
            id: 'latin-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6x0',
            title: 'telepatía',
            artist: 'Kali Uchis',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 160000,
            explicit: false
        },
        {
            id: 'latin-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbe02',
            title: 'Todo De Ti',
            artist: 'Rauw Alejandro',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 199000,
            explicit: false
        },
        {
            id: 'latin-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwS',
            title: 'Ella Baila Sola',
            artist: 'Eslabon Armado, Peso Pluma',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 165000,
            explicit: false
        },
        {
            id: 'latin-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xv',
            title: 'Feliz Cumpleaños Ferxxo',
            artist: 'Feid',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 156000,
            explicit: true
        },
        {
            id: 'latin-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e51',
            title: 'Hips Don\'t Lie',
            artist: 'Shakira, Wyclef Jean',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 218000,
            explicit: false
        }
    ],
    'afrobeats': [
        {
            id: 'afro-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9bd',
            title: 'Last Last',
            artist: 'Burna Boy',
            albumArt: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 172000,
            explicit: true
        },
        {
            id: 'afro-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7m',
            title: 'Calm Down',
            artist: 'Rema',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 219000,
            explicit: false
        },
        {
            id: 'afro-3',
            spotifyId: '4HlFJVsn89799tWlg879ee',
            title: 'Essence',
            artist: 'Wizkid, Tems',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 248000,
            explicit: false
        },
        {
            id: 'afro-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6x1',
            title: 'Lonely At The Top',
            artist: 'Asake',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 157000,
            explicit: false
        },
        {
            id: 'afro-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbe03',
            title: 'Free Mind',
            artist: 'Tems',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 247000,
            explicit: false
        },
        {
            id: 'afro-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwT',
            title: 'love nwantiti',
            artist: 'CKay',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 145000,
            explicit: false
        },
        {
            id: 'afro-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xw',
            title: 'soso',
            artist: 'Omah Lay',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 183000,
            explicit: false
        },
        {
            id: 'afro-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e52',
            title: 'Peru',
            artist: 'Fireboy DML, Ed Sheeran',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 187000,
            explicit: false
        }
    ],
    'electronic': [
        {
            id: 'edm-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9be',
            title: 'One More Time',
            artist: 'Daft Punk',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 320000,
            explicit: false
        },
        {
            id: 'edm-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7n',
            title: 'Latch',
            artist: 'Disclosure, Sam Smith',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 256000,
            explicit: false
        },
        {
            id: 'edm-3',
            spotifyId: '4iV5W9uYEdYUVa79Axb7Rt',
            title: 'Danielle (smile on my face)',
            artist: 'Fred again..',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 201000,
            explicit: false
        },
        {
            id: 'edm-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6x2',
            title: 'Summer',
            artist: 'Calvin Harris',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 222000,
            explicit: false
        },
        {
            id: 'edm-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbe04',
            title: 'Levels',
            artist: 'Avicii',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 198000,
            explicit: false
        },
        {
            id: 'edm-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwU',
            title: 'Innerbloom',
            artist: 'RÜFÜS DU SOL',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 578000,
            explicit: false
        },
        {
            id: 'edm-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xx',
            title: 'Never Be Like You',
            artist: 'Flume, Kai',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 234000,
            explicit: true
        },
        {
            id: 'edm-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e53',
            title: 'Sun Models',
            artist: 'ODESZA, Madelyn Grant',
            albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 160000,
            explicit: false
        }
    ],
    'chill': [
        {
            id: 'chill-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9bf',
            title: 'Skinny Love',
            artist: 'Bon Iver',
            albumArt: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 239000,
            explicit: false
        },
        {
            id: 'chill-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7o',
            title: 'Banana Pancakes',
            artist: 'Jack Johnson',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 192000,
            explicit: false
        },
        {
            id: 'chill-3',
            spotifyId: '4iV5W9uYEdYUVa79Axb7Ru',
            title: 'Apocalypse',
            artist: 'Cigarettes After Sex',
            albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 290000,
            explicit: false
        },
        {
            id: 'chill-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6x3',
            title: 'Flightless Bird, American Mouth',
            artist: 'Iron & Wine',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 242000,
            explicit: false
        },
        {
            id: 'chill-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbe05',
            title: 'The Night We Met',
            artist: 'Lord Huron',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 208000,
            explicit: false
        },
        {
            id: 'chill-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwV',
            title: 'Anchor',
            artist: 'Novo Amor',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 197000,
            explicit: false
        },
        {
            id: 'chill-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xy',
            title: 'Where\'s My Love',
            artist: 'SYML',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 202000,
            explicit: false
        },
        {
            id: 'chill-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e54',
            title: 'San Luis',
            artist: 'Gregory Alan Isakov',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 301000,
            explicit: false
        }
    ],
    'country': [
        {
            id: 'country-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9c0',
            title: 'Fast Car',
            artist: 'Luke Combs',
            albumArt: 'https://plus.unsplash.com/premium_photo-1737392495642-0827bfb98660?crop=entropy&cs=tinysrgb&fit=max&auto=format&q=80&w=600',
            previewUrl: '',
            duration_ms: 265000,
            explicit: false
        },
        {
            id: 'country-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7p',
            title: 'Tennessee Whiskey',
            artist: 'Chris Stapleton',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 293000,
            explicit: false
        },
        {
            id: 'country-3',
            spotifyId: '4HlFJVsn89799tWlg879ef',
            title: 'Something in the Orange',
            artist: 'Zach Bryan',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 228000,
            explicit: false
        },
        {
            id: 'country-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6x4',
            title: 'Last Night',
            artist: 'Morgan Wallen',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 163000,
            explicit: true
        },
        {
            id: 'country-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbe06',
            title: 'Jolene',
            artist: 'Dolly Parton',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 161000,
            explicit: false
        },
        {
            id: 'country-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwW',
            title: 'Ring of Fire',
            artist: 'Johnny Cash',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 157000,
            explicit: false
        },
        {
            id: 'country-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Xz',
            title: 'Slow Burn',
            artist: 'Kacey Musgraves',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 246000,
            explicit: false
        },
        {
            id: 'country-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e55',
            title: '\'Til You Can\'t',
            artist: 'Cody Johnson',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 224000,
            explicit: false
        }
    ],
    'lo-fi': [
        {
            id: 'lofi-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9c1',
            title: 'i\'m closing my eyes',
            artist: 'potsu, shiloh',
            albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 130000,
            explicit: false
        },
        {
            id: 'lofi-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7q',
            title: 'Affection',
            artist: 'Jinsang',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 142000,
            explicit: false
        },
        {
            id: 'lofi-3',
            spotifyId: '4HlFJVsn89799tWlg879eg',
            title: 'Sunbeams',
            artist: 'Kupla',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 165000,
            explicit: false
        },
        {
            id: 'lofi-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6x5',
            title: 'nagashi',
            artist: 'idealism',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 147000,
            explicit: false
        },
        {
            id: 'lofi-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbe07',
            title: 'Sakura Trees',
            artist: 'Saib',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 132000,
            explicit: false
        },
        {
            id: 'lofi-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwX',
            title: 'Skateboard P',
            artist: 'Elijah Who',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 124000,
            explicit: false
        },
        {
            id: 'lofi-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Y0',
            title: 'Grape Soda',
            artist: 'Rook1e',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 137000,
            explicit: false
        },
        {
            id: 'lofi-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e56',
            title: 'Tully',
            artist: 'HM Surf',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 154000,
            explicit: false
        }
    ],
    'workout': [
        {
            id: 'workout-1',
            spotifyId: '2b8Ag0Y0P4k5s6X7y8Z9c2',
            title: '\'Till I Collapse',
            artist: 'Eminem, Nate Dogg',
            albumArt: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 297000,
            explicit: true
        },
        {
            id: 'workout-2',
            spotifyId: '3U4isOIWM3VvDubwSI3y7r',
            title: 'Eye of the Tiger',
            artist: 'Survivor',
            albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 245000,
            explicit: false
        },
        {
            id: 'workout-3',
            spotifyId: '4HlFJVsn89799tWlg879eh',
            title: 'Titanium',
            artist: 'David Guetta, Sia',
            albumArt: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 245000,
            explicit: false
        },
        {
            id: 'workout-4',
            spotifyId: '0pqnGHJpmpxLKifKR2L6x6',
            title: 'Animals',
            artist: 'Martin Garrix',
            albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 176000,
            explicit: false
        },
        {
            id: 'workout-5',
            spotifyId: '1BxfuPKGuaTgP7aM0fbe08',
            title: 'Fight Back',
            artist: 'NEFFEX',
            albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 196000,
            explicit: false
        },
        {
            id: 'workout-6',
            spotifyId: '77d29hR3r5BqXyR02V6XwY',
            title: 'Firestarter',
            artist: 'The Prodigy',
            albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 280000,
            explicit: false
        },
        {
            id: 'workout-7',
            spotifyId: '2qSkIjg1o9h3e9v4P0w2Y1',
            title: 'Spaceman',
            artist: 'Hardwell',
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 202000,
            explicit: false
        },
        {
            id: 'workout-8',
            spotifyId: '5AhTN0Z1i0qR0Z5g2w3e57',
            title: 'Pursuit of Happiness - Extended Steve Aoki Remix',
            artist: 'Kid Cudi, Steve Aoki',
            albumArt: 'https://images.unsplash.com/photo-1445985543468-994240c1df50?q=80&w=600&auto=format&fit=crop',
            previewUrl: '',
            duration_ms: 373000,
            explicit: true
        }
    ]
};

export function getFallbackTracksForGenre(genreSlug: string, excludeIds?: Set<string>): FallbackTrack[] {
    let pool: FallbackTrack[] = [];

    if (genreSlug === 'explore' || genreSlug === 'discover' || genreSlug === 'random') {
        // Collect tracks from across all genres for an eclectic mix
        const allGenres = Object.keys(FALLBACK_TRACKS_BY_GENRE);
        const samplePool: FallbackTrack[] = [];
        for (const g of allGenres) {
            const tracks = FALLBACK_TRACKS_BY_GENRE[g];
            if (tracks && tracks.length > 0) {
                // pick 1-2 random tracks per genre
                const shuffled = [...tracks].sort(() => 0.5 - Math.random());
                samplePool.push(...shuffled.slice(0, 2));
            }
        }
        pool = samplePool;
    } else if (genreSlug === 'top-50') {
        const topGenres = ['pop', 'hip-hop', 'r-n-b', 'latin', 'opm', 'rock'];
        const samplePool: FallbackTrack[] = [];
        for (const g of topGenres) {
            const tracks = FALLBACK_TRACKS_BY_GENRE[g] || [];
            samplePool.push(...tracks.slice(0, 3));
        }
        pool = samplePool;
    } else {
        pool = FALLBACK_TRACKS_BY_GENRE[genreSlug] || FALLBACK_TRACKS_BY_GENRE['indie'] || [];
    }

    let filtered = pool;
    if (excludeIds && excludeIds.size > 0) {
        filtered = pool.filter((t) => !excludeIds.has(t.spotifyId));
    }

    // If all tracks in this genre were swiped, recycle the pool so user can dig again without dead-ending
    if (filtered.length === 0) {
        filtered = pool;
    }

    // Shuffle and assign a unique runtime id so Svelte can key them safely
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 15).map((t) => ({
        ...t,
        id: Math.random().toString(36).substring(7)
    }));
}
