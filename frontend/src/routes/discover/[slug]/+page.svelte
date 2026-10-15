<script lang="ts">
  import SwipeCard from '$lib/components/SwipeCard.svelte';
  import Aurora from '$lib/components/Aurora.svelte';
  import { fade, fly } from 'svelte/transition';
  import { savedTracks } from '$lib/stores/savedTracks';
  import { Heart, X, RotateCcw, Sparkles, Disc3, Compass } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { getCanonicalUrl } from '$lib/config/site';

  let { data } = $props();

  const HINT_KEY = 'hearmeout_seen_swipe_hint';
  const EXIT_MS = 380; // must match the card's fling transition

  /** Front of the deck is index 0. New tracks are appended to the back. */
  // svelte-ignore state_referenced_locally
  let tracks = $state([...data.tracks]);
  // svelte-ignore state_referenced_locally
  let loadedSlug = data.categorySlug;
  // svelte-ignore state_referenced_locally
  let seenSpotifyIds = new Set<string>((data.tracks || []).map((t: any) => t.spotifyId));
  let exiting = $state<{ id: string; dir: 'left' | 'right' } | null>(null);
  let history = $state<{ track: any; dir: 'left' | 'right' }[]>([]);
  let isLoadingMore = $state(false);
  let showHint = $state(false);
  let toast = $state<{ title: string; dir: 'left' | 'right' } | null>(null);
  let savedCount = $state(0);

  let toastTimer: ReturnType<typeof setTimeout>;

  let front = $derived(tracks[0] ?? null);
  // One extra while a card is flying out, so the back of the stack stays filled
  let visible = $derived(tracks.slice(0, exiting ? 4 : 3));

  // ── Deck sizing ─────────────────────────────────────────
  // A card is a square cover plus a title block (~0.26 of the cover's width), and
  // its whole size is driven by width. So to guarantee it fits a short screen we
  // measure the space the deck actually got and derive the width from that —
  // CSS aspect-ratio can't do this, since clamping one axis just breaks the ratio.
  // Reserves two full lines of title, artist, and the audio preview control
  const TITLE_RATIO = 1.42;
  let winW = $state(0);
  let deckAreaH = $state(0);

  let cardWidth = $derived.by(() => {
    const byWidth = winW ? Math.min(winW * 0.86, 352) : 352;
    const byHeight = deckAreaH ? deckAreaH / TITLE_RATIO : Infinity;
    return Math.max(150, Math.min(byWidth, byHeight));
  });
  let categoryName = $derived(data.categorySlug.replace(/-/g, ' '));

  function getStoredSeen(slug: string): Set<string> {
    try {
      const stored = sessionStorage.getItem(`hearmeout_seen_${slug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {}
    return new Set<string>();
  }

  function saveStoredSeen(slug: string, ids: Set<string>) {
    try {
      const arr = Array.from(ids).slice(-100);
      sessionStorage.setItem(`hearmeout_seen_${slug}`, JSON.stringify(arr));
    } catch {}
  }

  onMount(() => {
    showHint = !localStorage.getItem(HINT_KEY);
    const stored = getStoredSeen(data.categorySlug);
    stored.forEach((id) => seenSpotifyIds.add(id));
    if (tracks.filter((t) => !stored.has(t.spotifyId)).length <= 4) {
      fetchMoreTracks();
    }
  });

  // SvelteKit reuses this component between genres, so the deck has to be
  // rebuilt by hand when the route param changes.
  $effect(() => {
    if (data.categorySlug === loadedSlug) return;
    loadedSlug = data.categorySlug;
    tracks = [...data.tracks];
    const stored = getStoredSeen(data.categorySlug);
    seenSpotifyIds = new Set<string>((data.tracks || []).map((t: any) => t.spotifyId));
    stored.forEach((id) => seenSpotifyIds.add(id));
    history = [];
    exiting = null;
    savedCount = 0;
    isLoadingMore = false;
  });

  async function fetchMoreTracks() {
    if (isLoadingMore) return;
    isLoadingMore = true;
    try {
      const excludeList = Array.from(seenSpotifyIds).slice(-60).join(',');
      const res = await fetch(`/api/tracks?slug=${data.categorySlug}&exclude=${encodeURIComponent(excludeList)}`);
      if (res.ok) {
        const incoming = await res.json();
        const incomingArr = Array.isArray(incoming) ? incoming : [];
        const fresh = incomingArr.filter(
          (t: any) => t?.spotifyId && !seenSpotifyIds.has(t.spotifyId)
        );
        fresh.forEach((t: any) => seenSpotifyIds.add(t.spotifyId));
        tracks = [...tracks, ...fresh];
        saveStoredSeen(data.categorySlug, seenSpotifyIds);
      }
    } catch (e) {
      console.error('Failed to fetch more tracks', e);
    }
    isLoadingMore = false;
  }

  function commit(dir: 'left' | 'right') {
    if (exiting || !front) return;

    const track = front;
    seenSpotifyIds.add(track.spotifyId);
    saveStoredSeen(data.categorySlug, seenSpotifyIds);
    exiting = { id: track.id, dir };

    if (showHint) {
      showHint = false;
      localStorage.setItem(HINT_KEY, '1');
    }

    if (dir === 'right') {
      savedTracks.saveTrack(track);
      savedCount += 1;
      fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, direction: dir })
      }).catch((e) => console.error('Error saving swipe log', e));
    }

    clearTimeout(toastTimer);
    toast = { title: track.title, dir };
    toastTimer = setTimeout(() => (toast = null), 1700);

    // Let the card fly clear before it leaves the DOM
    setTimeout(() => {
      tracks = tracks.filter((t) => t.id !== track.id);
      history = [{ track, dir }, ...history].slice(0, 20);
      exiting = null;
      if (tracks.length <= 4) fetchMoreTracks();
    }, EXIT_MS);
  }

  function undo() {
    if (exiting || history.length === 0) return;
    const [last, ...rest] = history;
    history = rest;
    if (last.dir === 'right') {
      savedTracks.removeTrack(last.track.spotifyId);
      savedCount = Math.max(0, savedCount - 1);
    }
    tracks = [last.track, ...tracks];
    navigator.vibrate?.(8);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      commit('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      commit('right');
    } else if (e.key === 'z' || e.key === 'Backspace') {
      e.preventDefault();
      undo();
    } else if (e.code === 'Space' || e.key === ' ') {
      // Prevent browser from scrolling down the page
      e.preventDefault();
    }
  }

  let formattedCategory = $derived(
    data.categoryName ||
    categoryName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );

  let isExplore = $derived(data.categorySlug === 'explore');

  let pageTitle = $derived(
    isExplore
      ? 'Explore Music & Fresh Discoveries — Songs for Stories & Reels'
      : data.categorySlug === 'opm'
        ? 'OPM Hits — Filipino Songs for Stories, Reels & Playlists'
        : data.categorySlug === 'lo-fi'
          ? 'Lo-Fi Beats — Aesthetic Chill Songs for Vlogs & Stories'
          : data.categorySlug === 'chill'
            ? 'Chill & Relax — Aesthetic Songs for Photo Dumps & Stories'
            : data.categorySlug === 'workout'
              ? 'Workout Music — High Energy Beats for Gym Stories & Reels'
              : data.categorySlug === 'indie'
                ? 'Indie Vibes — Aesthetic Alternative Songs for Reels & Stories'
                : `${formattedCategory} Songs — 30s Clips for Stories & Playlists`
  );

  let pageDescription = $derived(
    isExplore
      ? 'Explore an eclectic mix of trending hits, aesthetic tracks, and hidden gems. Preview 30-second clips to find the perfect soundtrack for your Instagram stories, reels, or photo dumps, and swipe to save straight to Spotify.'
      : data.categorySlug === 'opm'
        ? 'Preview and swipe through trending OPM hits and classic Filipino songs. Audition 30-second clips for your stories, travel reels, and posts, and save the best Pinoy music to Spotify.'
        : data.categorySlug === 'lo-fi'
          ? 'Audition aesthetic lo-fi beats and cozy instrumentals. Find the perfect 30-second background music for study vlogs, aesthetic stories, and chill reels.'
          : data.categorySlug === 'chill'
            ? 'Discover relaxed, dreamy vibes for your photo dumps, sunset clips, and aesthetic stories. Listen to 30-second previews and swipe to save.'
            : data.categorySlug === 'workout'
              ? 'Find high-energy workout beats and gym anthems for your fitness reels, PR stories, and training playlists. Swipe 30-second previews to save.'
              : data.categorySlug === 'indie'
                ? 'Preview fresh indie discoveries and aesthetic alternative tracks. Find the perfect vibe for your Instagram reels and stories.'
                : `Preview and swipe through trending ${formattedCategory} music. Hear 30-second clips to find the right sound for your stories and playlists, and save straight to Spotify.`
  );

  let categoryKeywords = $derived([
    `${formattedCategory.toLowerCase()} songs`,
    `songs for instagram stories ${formattedCategory.toLowerCase()}`,
    `songs for reels`,
    `photo dump songs`,
    `music for stories`,
    `30 second music preview`,
    `${formattedCategory.toLowerCase()} playlist`,
    'discover new songs',
    'swipe music'
  ]);

  let playlistSchema = $derived({
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    name: isExplore ? 'Eclectic Music Discovery & Mix' : `${formattedCategory} Music Discovery`,
    numTracks: tracks.length,
    genre: isExplore ? 'Eclectic Music Mix' : formattedCategory,
    url: getCanonicalUrl(`/discover/${data.categorySlug}`),
    description: pageDescription,
    track: tracks.slice(0, 15).map((t: any) => ({
      '@type': 'MusicRecording',
      name: t.title,
      byArtist: {
        '@type': 'MusicGroup',
        name: t.artist
      },
      image: t.albumArt,
      duration: 'PT30S',
      ...(t.previewUrl ? { audio: t.previewUrl } : {})
    }))
  });

  let breadcrumbs = $derived([
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: formattedCategory, url: `/discover/${data.categorySlug}` }
  ]);

  const quickGenres = [
    { name: 'Explore', slug: 'explore' },
    { name: 'Pop', slug: 'pop' },
    { name: 'Rock', slug: 'rock' },
    { name: 'OPM Hits', slug: 'opm' },
    { name: 'Hip-Hop', slug: 'hip-hop' }
  ];
</script>

<SEO
  title={pageTitle}
  description={pageDescription}
  pathname={`/discover/${data.categorySlug}`}
  keywords={categoryKeywords}
  ogType="music.playlist"
  image={front?.albumArt || undefined}
  imageAlt={`${formattedCategory} music on HearMeOut`}
  schema={playlistSchema}
  breadcrumbs={breadcrumbs}
  audioPreviewUrl={front?.previewUrl || undefined}
/>

<svelte:window onkeydown={handleKeydown} bind:innerWidth={winW} />

<div
  class="relative flex h-dvh flex-col overflow-hidden bg-background text-white select-none"
  in:fade={{ duration: 200 }}
>
  <h1 class="sr-only">
    {isExplore
      ? 'Explore Music & Discover Fresh Songs — Swipe & Preview on HearMeOut'
      : `Discover ${formattedCategory} Songs — Swipe & Preview on HearMeOut`}
  </h1>

  <!-- ── Semantic Crawlable Track List for Search Engines & Accessibility ── -->
  <section class="sr-only" aria-label="Curated {formattedCategory} Songs in this Crate">
    <h2>Featured {formattedCategory} Tracklist</h2>
    <ol>
      {#each data.tracks as track}
        <li>
          <strong>{track.title}</strong> by <span>{track.artist}</span>
          {#if track.explicit}<span> (Explicit)</span>{/if}
          {#if track.album}<span> — {track.album}</span>{/if}
        </li>
      {/each}
    </ol>
  </section>
  <!-- ── Ambient backdrop, tinted by the front cover ────── -->
  <Aurora intensity={0.45} />
  {#if front}
    {#key front.id}
      <div
        class="pointer-events-none absolute inset-0 z-0"
        in:fade={{ duration: 700 }}
        out:fade={{ duration: 700 }}
      >
        <!-- Lighthouse's largest element on this page (it paints before the
             card stack finishes animating in) -->
        <img
          src={front.albumArt}
          alt=""
          fetchpriority="high"
          class="h-full w-full scale-125 object-cover opacity-25 blur-3xl"
        />
      </div>
    {/key}
  {/if}
  <div
    class="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-background/85 via-transparent to-background"
  ></div>

  <!-- Just navbar clearance now — the saved-count chip lived here but was
       redundant with the badge already on the navbar's library icon. -->
  <div class="relative z-20 h-20 shrink-0"></div>

  <!-- ── Deck ───────────────────────────────────────────── -->
  <div
    class="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4"
    bind:clientHeight={deckAreaH}
  >
    {#if tracks.length > 0}
      <div class="relative" style="width: {cardWidth}px; height: {cardWidth * TITLE_RATIO}px;">
        {#each visible as track, i (track.id)}
          {@const ex = exiting}
          {@const dir = ex && ex.id === track.id ? ex.dir : null}
          <!-- A card mid-fling sits at depth -1 so the one behind promotes immediately -->
          {@const depth = dir ? -1 : ex ? i - 1 : i}
          <!-- Clamped so the spare card waiting behind the stack is invisible -->
          {@const vd = Math.min(depth, 2)}
          <div
            class="absolute inset-x-0 top-0 flex justify-center"
            style="z-index: {20 - depth * 2};
                   transform: {vd < 0
              ? 'none'
              : `scale(${1 - vd * 0.05}) translateY(${vd * -16}px)`};
                   filter: blur({vd >= 2 ? 3 : 0}px);
                   opacity: {vd >= 2 ? 0.7 : 1};
                   transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
                               filter 380ms ease, opacity 380ms ease;"
          >
            <SwipeCard
              {track}
              isActive={depth === 0}
              shouldPrefetch={depth <= 1}
              exitDir={dir}
              onCommit={commit}
              showHint={showHint && depth === 0}
              onPreviewResolved={(url) => {
                tracks = tracks.map((t) => (t.id === track.id ? { ...t, previewUrl: url } : t));
              }}
            />
          </div>
        {/each}
      </div>
    {:else if isLoadingMore}
      <div class="flex flex-col items-center gap-6 py-16" in:fade>
        <div class="relative h-20 w-20">
          <div class="absolute inset-0 rounded-full border-4 border-white/10"></div>
          <div
            class="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary border-r-spotify"
          ></div>
        </div>
        <p class="text-base font-medium text-white/50">Digging up more {categoryName}…</p>
      </div>
    {:else}
      <div class="relative z-10 mx-auto flex w-full max-w-md flex-col items-center justify-center text-center px-4 py-6" in:fade>
        <!-- Vinyl graphic with subtle neon aura -->
        <div class="relative mb-5 flex items-center justify-center">
          <div
            class="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse"
            aria-hidden="true"
          ></div>
          <div
            class="glass-strong relative flex h-20 w-20 items-center justify-center rounded-full border border-white/15 shadow-[0_0_35px_rgba(29,185,84,0.3)] sm:h-24 sm:w-24"
          >
            <Disc3
              size={44}
              class="text-primary animate-[spin_10s_linear_infinite]"
              strokeWidth={1.75}
            />
            <div class="absolute h-3.5 w-3.5 rounded-full bg-background border-2 border-white/30"></div>
          </div>
        </div>

        <!-- Pill badge -->
        <div
          class="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-primary uppercase backdrop-blur-md"
        >
          <span>Crate Finished</span>
        </div>

        <h2 class="font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
          That's the whole crate
        </h2>
        <p class="mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-white/60">
          You've listened through every track in <span class="text-white font-medium">{formattedCategory}</span>.
        </p>

        <!-- Action buttons -->
        <div class="mt-6 flex w-full flex-col items-center justify-center gap-2.5 sm:flex-row">
          <a
            href="/categories"
            class="brand-gradient flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03] active:scale-95 sm:w-auto"
          >
            <Disc3 size={16} />
            <span>Browse Crates</span>
          </a>
          <a
            href="/saved"
            class="glass flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white transition-all hover:bg-white/15 active:scale-95 sm:w-auto"
          >
            <span>See Saves ({savedCount || 0})</span>
          </a>
        </div>

        <!-- Quick Crate jump links -->
        <div class="mt-6 flex flex-col items-center gap-2">
          <span class="text-[10px] font-semibold tracking-[0.2em] text-white/35 uppercase">
            Jump to another vibe
          </span>
          <div class="flex flex-wrap items-center justify-center gap-1.5">
            {#each quickGenres.filter((g) => g.slug !== data.categorySlug) as genre}
              <a
                href="/discover/{genre.slug}"
                class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75 transition-all hover:border-primary/50 hover:bg-white/10 hover:text-white active:scale-95"
              >
                {genre.name}
              </a>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- ── Controls ───────────────────────────────────────── -->
  {#if tracks.length > 0}
    <div
      class="relative z-20 flex shrink-0 flex-col items-center gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
    >
      <div class="flex items-center gap-5 sm:gap-7">
        <button
          onclick={undo}
          disabled={history.length === 0 || !!exiting}
          aria-label="Undo last swipe"
          class="glass grid h-12 w-12 place-items-center rounded-full text-white/70 transition-all active:scale-90 disabled:opacity-25 enabled:hover:bg-white/10 enabled:hover:text-white"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onclick={() => commit('left')}
          disabled={!!exiting}
          aria-label="Skip this track"
          class="grid h-17 w-17 place-items-center rounded-full border-2 border-skip/70 bg-skip/10 text-skip shadow-xl shadow-skip/15 backdrop-blur-md transition-all active:scale-90 enabled:hover:bg-skip enabled:hover:text-white sm:h-20 sm:w-20"
        >
          <X size={30} strokeWidth={3} />
        </button>

        <button
          onclick={() => commit('right')}
          disabled={!!exiting}
          aria-label="Save this track"
          class="grid h-17 w-17 place-items-center rounded-full border-2 border-save/70 bg-save/10 text-save shadow-xl shadow-save/15 backdrop-blur-md transition-all active:scale-90 enabled:hover:bg-save enabled:hover:text-white sm:h-20 sm:w-20"
        >
          <Heart size={30} fill="currentColor" />
        </button>

        <div class="h-12 w-12" aria-hidden="true"></div>
      </div>

      <p class="text-[10px] font-semibold tracking-[0.22em] text-white/30 uppercase">
        <span class="hidden sm:inline">← Pass &nbsp;·&nbsp; Space to Play &nbsp;·&nbsp; Save →</span>
        <span class="sm:hidden">swipe left to pass or right to save</span>
      </p>
    </div>
  {/if}

  <!-- ── Swipe confirmation toast ───────────────────────── -->
  {#if toast}
    <div
      class="pointer-events-none absolute inset-x-0 bottom-[max(7.5rem,calc(env(safe-area-inset-bottom)+7.5rem))] z-30 flex justify-center px-6"
      in:fly={{ y: 16, duration: 220 }}
      out:fade={{ duration: 180 }}
    >
      <!-- rounded-3xl rather than a pill: the title wraps in full instead of clipping -->
      <div
        class="glass-strong flex max-w-full items-center gap-2.5 rounded-3xl py-2.5 pr-4 pl-3.5"
        style="border-color: {toast.dir === 'right'
          ? 'rgba(29,185,84,0.5)'
          : 'rgba(239,68,68,0.4)'}"
      >
        {#if toast.dir === 'right'}
          <Heart size={16} class="shrink-0 text-save" fill="currentColor" />
          <span class="text-sm font-semibold break-words text-white">Saved “{toast.title}”</span>
        {:else}
          <X size={16} class="shrink-0 text-skip" strokeWidth={3} />
          <span class="text-sm font-semibold text-white/70">Skipped</span>
        {/if}
      </div>
    </div>
  {/if}
</div>
