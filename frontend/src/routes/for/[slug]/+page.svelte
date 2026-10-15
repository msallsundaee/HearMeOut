<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import Aurora from '$lib/components/Aurora.svelte';
	import ExplicitBadge from '$lib/components/ExplicitBadge.svelte';
	import { siteConfig, getCanonicalUrl } from '$lib/config/site';
	import {
		Music,
		Flame,
		Headphones,
		Sparkles,
		CheckCircle2,
		ArrowRight,
		ListMusic,
		Play,
		Pause,
		Disc3
	} from 'lucide-svelte';

	let { data } = $props();

	let currentAudio = $state<HTMLAudioElement | null>(null);
	let playingTrackId = $state<string | null>(null);

	function toggleAudio(track: any) {
		if (!track.previewUrl) return;

		if (playingTrackId === track.id) {
			currentAudio?.pause();
			playingTrackId = null;
			return;
		}

		if (currentAudio) {
			currentAudio.pause();
		}

		const audio = new Audio(track.previewUrl);
		audio.play().catch((e) => console.error('Audio playback error', e));
		audio.onended = () => {
			playingTrackId = null;
		};
		currentAudio = audio;
		playingTrackId = track.id;
	}

	let breadcrumbs = $derived([
		{ name: 'Home', url: '/' },
		{ name: 'For Creators', url: `/for/${data.useCase.slug}` },
		{ name: data.useCase.h1, url: `/for/${data.useCase.slug}` }
	]);

	let pageSchema = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			name: data.useCase.title,
			description: data.useCase.description,
			url: getCanonicalUrl(`/for/${data.useCase.slug}`),
			isPartOf: {
				'@type': 'WebSite',
				name: siteConfig.name,
				url: siteConfig.url
			}
		},
		{
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: data.useCase.faqs.map((faq: { question: string; answer: string }) => ({
				'@type': 'Question',
				name: faq.question,
				acceptedAnswer: {
					'@type': 'Answer',
					text: faq.answer
				}
			}))
		},
		{
			'@context': 'https://schema.org',
			'@type': 'ItemList',
			name: `Featured Tracks for ${data.useCase.h1}`,
			itemListElement: (data.sampleTracks || []).map((track: any, index: number) => ({
				'@type': 'ListItem',
				position: index + 1,
				item: {
					'@type': 'MusicRecording',
					name: track.title,
					byArtist: {
						'@type': 'MusicGroup',
						name: track.artist
					},
					duration: 'PT30S',
					image: track.albumArt
				}
			}))
		}
	]);
</script>

<SEO
	title={data.useCase.title}
	description={data.useCase.description}
	pathname={`/for/${data.useCase.slug}`}
	keywords={data.useCase.keywords}
	schema={pageSchema}
	breadcrumbs={breadcrumbs}
/>

<div class="relative min-h-screen bg-background text-white selection:bg-primary/30">
	<Aurora intensity={0.4} />

	<!-- ── Hero Section ───────────────────────────────────── -->
	<header class="relative z-10 mx-auto max-w-4xl px-4 pt-28 pb-12 text-center sm:pt-36 sm:pb-16">
		<div
			class="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md"
		>
			<Sparkles size={14} />
			<span>30-Second Music Auditions</span>
		</div>

		<h1
			class="font-display mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl"
		>
			{data.useCase.h1}
		</h1>

		<p class="mx-auto mt-4 max-w-2xl text-base text-gray-300 sm:text-xl">
			{data.useCase.tagline}
		</p>

		<!-- Direct CTA Button to Jump straight into Swiping -->
		<div class="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
			<a
				href="/discover/{data.useCase.primaryGenre}"
				class="flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-black shadow-lg shadow-white/10 transition-all hover:scale-105 hover:bg-gray-200 active:scale-95 sm:w-auto sm:text-lg"
			>
				<Flame size={20} class="text-primary" />
				<span>Start Swiping Now</span>
			</a>
			<a
				href="/categories"
				class="glass flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white transition-all hover:bg-white/15 active:scale-95 sm:w-auto sm:text-lg"
			>
				<Disc3 size={20} />
				<span>Browse All Vibe Crates</span>
			</a>
		</div>

		<!-- Quick Crate Pills -->
		<div class="mt-8 flex flex-wrap items-center justify-center gap-2">
			<span class="text-xs font-semibold tracking-wider text-gray-400 uppercase">
				Popular Crates:
			</span>
			{#each data.useCase.suggestedCrates as crate}
				<a
					href="/discover/{crate.slug}"
					class="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-gray-300 transition-colors hover:border-primary/50 hover:bg-white/10 hover:text-white"
				>
					{crate.name}
				</a>
			{/each}
		</div>
	</header>

	<!-- ── AEO Answer Engine Highlight Block ─────────────── -->
	<section class="relative z-10 mx-auto max-w-4xl px-4 py-8">
		<div
			class="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
		>
			<h2 class="text-xs font-mono font-bold tracking-widest text-primary uppercase">
				Quick Summary & How It Works
			</h2>
			<h3 class="mt-2 text-xl font-bold text-white sm:text-2xl">
				Why HearMeOut is Built for Stories & Reels
			</h3>
			<p class="mt-3 text-sm leading-relaxed text-gray-300 sm:text-base">
				Instagram Stories and Reels clip music into short, impactful snippets. Instead of
				scrubbing through full 3-minute tracks on Spotify, HearMeOut loads the exact 30-second
				audio hook instantly. Swipe right if the song fits your visual mood; swipe left to skip.
				Once you're done, export your saved tracks directly to your personal Spotify account with a
				single click.
			</p>
		</div>
	</section>

	<!-- ── Featured Track Previews (SSR Crawlable) ────────── -->
	<section class="relative z-10 mx-auto max-w-4xl px-4 py-12">
		<div class="flex items-center justify-between pb-6 border-b border-gray-800">
			<div>
				<h2 class="text-2xl font-bold text-white sm:text-3xl">Trending 30-Second Previews</h2>
				<p class="text-sm text-gray-400">Click to listen or launch the swipe deck</p>
			</div>
			<a
				href="/discover/{data.useCase.primaryGenre}"
				class="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:flex"
			>
				<span>Open Full Deck</span>
				<ArrowRight size={16} />
			</a>
		</div>

		<div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#each (data.sampleTracks || []) as track}
				<div
					class="glass flex items-center justify-between gap-4 rounded-2xl p-3.5 border border-white/5 transition-all hover:border-white/15 hover:bg-white/10"
				>
					<div class="flex items-center gap-3.5 min-w-0">
						<div class="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-800">
							<img src={track.albumArt} alt={track.title} class="h-full w-full object-cover" />
							{#if track.previewUrl}
								<button
									onclick={() => toggleAudio(track)}
									aria-label={playingTrackId === track.id ? 'Pause' : 'Play Preview'}
									class="absolute inset-0 grid place-items-center bg-black/40 text-white transition-opacity hover:bg-black/60"
								>
									{#if playingTrackId === track.id}
										<Pause size={18} fill="currentColor" />
									{:else}
										<Play size={18} fill="currentColor" class="ml-0.5" />
									{/if}
								</button>
							{/if}
						</div>

						<div class="min-w-0 flex-1">
							<p class="truncate text-sm font-semibold text-white">{track.title}</p>
							<p class="truncate text-xs text-gray-400 flex items-center gap-1.5">
								{#if track.explicit}
									<ExplicitBadge />
								{/if}
								<span class="truncate">{track.artist}</span>
							</p>
							<span class="inline-block mt-1 text-[10px] font-mono font-medium text-primary">
								30s preview
							</span>
						</div>
					</div>

					<a
						href="/discover/{data.useCase.primaryGenre}"
						aria-label="Swipe on {track.title}"
						class="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:border-primary/50 hover:text-white"
					>
						<Flame size={16} />
					</a>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Structured Comparison Table (AEO / GEO Snippet Bait) ── -->
	<section class="relative z-10 mx-auto max-w-4xl px-4 py-12">
		<h2 class="text-center text-2xl font-bold text-white sm:text-3xl">
			How HearMeOut Compares for Content Creators
		</h2>
		<p class="mx-auto mt-2 max-w-xl text-center text-sm text-gray-400">
			Why creators and curators switch from endless scrolling to swiping.
		</p>

		<div class="mt-8 overflow-x-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md">
			<table class="w-full text-left text-sm text-gray-300">
				<thead class="border-b border-white/10 bg-white/5 text-xs text-white uppercase font-mono">
					<tr>
						<th class="px-6 py-4 font-semibold">Feature</th>
						<th class="px-6 py-4 font-semibold text-primary">HearMeOut</th>
						<th class="px-6 py-4 font-semibold">Spotify App</th>
						<th class="px-6 py-4 font-semibold">TikTok Audio Search</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-white/5">
					<tr>
						<td class="px-6 py-4 font-medium text-white">Audio Previews</td>
						<td class="px-6 py-4 font-bold text-primary">Instant 30s clips</td>
						<td class="px-6 py-4 text-gray-400">Full song (manual scrub)</td>
						<td class="px-6 py-4 text-gray-400">15–60s video noise</td>
					</tr>
					<tr>
						<td class="px-6 py-4 font-medium text-white">Audition Interface</td>
						<td class="px-6 py-4 font-bold text-primary">Swipe deck (Right/Left)</td>
						<td class="px-6 py-4 text-gray-400">Vertical list</td>
						<td class="px-6 py-4 text-gray-400">Vertical video feed</td>
					</tr>
					<tr>
						<td class="px-6 py-4 font-medium text-white">Export to Spotify</td>
						<td class="px-6 py-4 font-bold text-primary">1-Click Auto-Playlist</td>
						<td class="px-6 py-4 text-gray-400">Native</td>
						<td class="px-6 py-4 text-gray-400">Manual search required</td>
					</tr>
					<tr>
						<td class="px-6 py-4 font-medium text-white">Login Required to Browse</td>
						<td class="px-6 py-4 font-bold text-primary">No login required</td>
						<td class="px-6 py-4 text-gray-400">Account required</td>
						<td class="px-6 py-4 text-gray-400">No login required</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<!-- ── Frequently Asked Questions (FAQPage) ───────────── -->
	<section class="relative z-10 mx-auto max-w-4xl px-4 py-12">
		<h2 class="text-center text-2xl font-bold text-white sm:text-3xl">Frequently Asked Questions</h2>
		<p class="mx-auto mt-2 max-w-xl text-center text-sm text-gray-400">
			Everything you need to know about auditioning and saving audio on HearMeOut.
		</p>

		<div class="mt-8 space-y-4">
			{#each data.useCase.faqs as faq}
				<div class="glass rounded-2xl border border-white/10 p-6">
					<h3 class="text-base font-bold text-white sm:text-lg">{faq.question}</h3>
					<p class="mt-2 text-sm leading-relaxed text-gray-300 sm:text-base">{faq.answer}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Bottom CTA ──────────────────────────────────────── -->
	<section class="relative z-10 mx-auto max-w-4xl px-4 pt-8 pb-24 text-center">
		<div class="glass-strong rounded-3xl border border-primary/20 p-8 sm:p-12">
			<h2 class="text-2xl font-black text-white sm:text-4xl">Ready to find your next soundtrack?</h2>
			<p class="mx-auto mt-3 max-w-md text-sm text-gray-300 sm:text-base">
				Swipe through hundreds of songs right now. No sign-up needed.
			</p>
			<div class="mt-6 flex justify-center">
				<a
					href="/discover/{data.useCase.primaryGenre}"
					class="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-black shadow-lg transition-all hover:scale-105 hover:bg-gray-200 active:scale-95"
				>
					<Flame size={20} class="text-primary" />
					<span>Start Swiping</span>
				</a>
			</div>
		</div>
	</section>
</div>
