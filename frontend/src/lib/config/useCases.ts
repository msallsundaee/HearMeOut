export interface UseCaseData {
	slug: string;
	title: string;
	h1: string;
	tagline: string;
	description: string;
	keywords: string[];
	primaryGenre: string;
	suggestedCrates: { name: string; slug: string }[];
	faqs: { question: string; answer: string }[];
}

export const USE_CASES: Record<string, UseCaseData> = {
	'instagram-stories': {
		slug: 'instagram-stories',
		title: 'Find Songs for Instagram Stories — 30s Audio Previews',
		h1: 'Find the Soundtrack for Your Instagram Story',
		tagline: 'Audition 30-second audio hooks and find the exact vibe for your story in seconds.',
		description:
			'Audition 30-second audio previews perfectly timed for Instagram Stories. Swipe right on tracks that match your mood, discover aesthetic songs, and sync them directly to your Spotify playlist.',
		keywords: [
			'songs for instagram stories',
			'find songs for stories',
			'music for instagram story',
			'aesthetic story music',
			'30 second song preview',
			'story soundtrack finder',
			'instagram story audio'
		],
		primaryGenre: 'explore',
		suggestedCrates: [
			{ name: 'Explore All', slug: 'explore' },
			{ name: 'Pop Hits', slug: 'pop' },
			{ name: 'Indie Vibes', slug: 'indie' },
			{ name: 'R&B Soul', slug: 'r-n-b' }
		],
		faqs: [
			{
				question: 'How do I find aesthetic songs for Instagram stories on HearMeOut?',
				answer:
					'HearMeOut provides 30-second audio previews tailored for Instagram stories. Swipe right on songs that match your aesthetic to save them, then export your saves straight to Spotify.'
			},
			{
				question: 'Why are the audio previews on HearMeOut 30 seconds long?',
				answer:
					'Instagram Stories display audio clips in up to 30-second segments. Hearing the exact 30-second hook gives you an instant feel for how the track will vibe with your video or photo before posting.'
			},
			{
				question: 'Do I need a Spotify account to discover story songs?',
				answer:
					'No account is required to start swiping and listening to audio previews. You only need to connect Spotify when you want to export your saved songs into a real playlist.'
			}
		]
	},
	'photo-dumps': {
		slug: 'photo-dumps',
		title: 'Aesthetic Songs for Instagram Photo Dumps & Carousels',
		h1: 'Aesthetic Songs for Your Next Photo Dump',
		tagline: 'Discover nostalgic, dreamy, and aesthetic soundtracks for your photo carousel dumps.',
		description:
			'Discover nostalgic, chill, and aesthetic songs for your photo dumps, monthly recaps, and carousel posts. Swipe through 30-second audio clips and export your keepers to Spotify.',
		keywords: [
			'songs for photo dump',
			'photo dump songs',
			'aesthetic songs for photo dumps',
			'photo dump audio aesthetic',
			'monthly dump songs',
			'carousel post music',
			'chill photo dump songs'
		],
		primaryGenre: 'indie',
		suggestedCrates: [
			{ name: 'Indie Vibes', slug: 'indie' },
			{ name: 'Pop Hits', slug: 'pop' },
			{ name: 'R&B Soul', slug: 'r-n-b' },
			{ name: 'Explore All', slug: 'explore' }
		],
		faqs: [
			{
				question: 'What kind of songs work best for a photo dump?',
				answer:
					'Great photo dump music is usually mellow, nostalgic, or aesthetic—such as bedroom pop, chill indie, or smooth R&B—giving your photo carousel an immersive emotional feel.'
			},
			{
				question: 'Can I preview multiple song ideas before deciding?',
				answer:
					'Yes. Simply swipe right on any songs you like while browsing. Review your saved list at any time and export the entire collection directly to your Spotify account.'
			},
			{
				question: 'Is HearMeOut free to use for finding photo dump songs?',
				answer:
					'HearMeOut is 100% free to use in your browser. You can swipe through endless tracks and preview clips with no subscription required.'
			}
		]
	},
	reels: {
		slug: 'reels',
		title: 'Trending Songs for Instagram Reels & TikToks (30s Audio Clips)',
		h1: 'Trending & High-Energy Songs for Reels & TikToks',
		tagline: 'High-energy beats, viral hooks, and fresh tracks for your short-form video content.',
		description:
			'Find high-energy beats, trending sounds, and viral music for Instagram Reels, TikToks, and YouTube Shorts. Swipe through 30-second previews and export to Spotify.',
		keywords: [
			'songs for reels',
			'trending songs for reels',
			'reels audio trending',
			'songs for tiktok',
			'high energy reels music',
			'workout reels audio',
			'viral sounds for reels'
		],
		primaryGenre: 'hip-hop',
		suggestedCrates: [
			{ name: 'Hip-Hop / Rap', slug: 'hip-hop' },
			{ name: 'Pop Hits', slug: 'pop' },
			{ name: 'Rock', slug: 'rock' },
			{ name: 'Explore All', slug: 'explore' }
		],
		faqs: [
			{
				question: 'How do I find trending audio for Reels on HearMeOut?',
				answer:
					'Pick a high-tempo crate like Hip-Hop, Pop, or Explore. Listen to the 30-second highlight of each track and swipe right on the beats that match your reel concept.'
			},
			{
				question: 'How does HearMeOut differ from searching on TikTok or Instagram?',
				answer:
					'HearMeOut strips away the noise and algorithms of video feeds, presenting pure 30-second music previews in a fast, distraction-free swipe deck with instant Spotify playlist export.'
			},
			{
				question: 'Can I audition music on both mobile and desktop?',
				answer:
					'Yes. HearMeOut is fully responsive and supports touch gestures on mobile as well as keyboard arrows (Left to pass, Right to save) on desktop.'
			}
		]
	}
};
