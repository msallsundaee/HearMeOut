<script lang="ts">
  import SwipeCard from '$lib/components/SwipeCard.svelte';
  import Aurora from '$lib/components/Aurora.svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { savedTracks } from '$lib/stores/savedTracks';
  import { Heart, X, RotateCcw, Library, Sparkles } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let { data } = $props();

  const HINT_KEY = 'hearmeout_seen_swipe_hint';
  const EXIT_MS = 380; // must match the card's fling transition

  /** Front of the deck is index 0. New tracks are appended to the back. */
  // svelte-ignore state_referenced_locally
  let tracks = $state([...data.tracks]);
  // svelte-ignore state_referenced_locally
  let loadedSlug = data.categorySlug;
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
  // Reserves two full lines of title plus the artist, so nothing has to truncate
  const TITLE_RATIO = 1.32;
  let winW = $state(0);
  let deckAreaH = $state(0);

  let cardWidth = $derived.by(() => {
    const byWidth = winW ? Math.min(winW * 0.86, 352) : 352;
    const byHeight = deckAreaH ? deckAreaH / TITLE_RATIO : Infinity;
    return Math.max(150, Math.min(byWidth, byHeight));
  });
  let categoryName = $derived(data.categorySlug.replace(/-/g, ' '));

  onMount(() => {
    showHint = !localStorage.getItem(HINT_KEY);
  });

  // SvelteKit reuses this component between genres, so the deck has to be
  // rebuilt by hand when the route param changes.
  $effect(() => {
    if (data.categorySlug === loadedSlug) return;
    loadedSlug = data.categorySlug;
    tracks = [...data.tracks];
    history = [];
    exiting = null;
    savedCount = 0;
    isLoadingMore = false;
  });

  async function fetchMoreTracks() {
    if (isLoadingMore) return;
    isLoadingMore = true;
    try {
      const res = await fetch(`/api/tracks?slug=${data.categorySlug}`);
      if (res.ok) {
        const incoming = await res.json();
        // Drop anything already in the deck or already judged
        const seen = new Set([...tracks.map((t) => t.id), ...history.map((h) => h.track.id)]);
        tracks = [...tracks, ...incoming.filter((t: any) => !seen.has(t.id))];
      }
    } catch (e) {
      console.error('Failed to fetch more tracks', e);
    }
    isLoadingMore = false;
  }

  function commit(dir: 'left' | 'right') {
    if (exiting || !front) return;

    const track = front;
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
      if (tracks.length <= 3) fetchMoreTracks();
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
    }
  }
</script>

<svelte:head>
  <title>{categoryName} — HearMeOut</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} bind:innerWidth={winW} />

<div
  class="relative flex h-dvh flex-col overflow-hidden bg-background text-white select-none"
  in:fade={{ duration: 200 }}
>
  <!-- ── Ambient backdrop, tinted by the front cover ────── -->
  <Aurora intensity={0.45} />
  {#if front}
    {#key front.id}
      <div
        class="pointer-events-none absolute inset-0 z-0"
        in:fade={{ duration: 700 }}
        out:fade={{ duration: 700 }}
      >
        <img
          src={front.albumArt}
          alt=""
          class="h-full w-full scale-125 object-cover opacity-25 blur-3xl"
        />
      </div>
    {/key}
  {/if}
  <div
    class="pointer-events-none absolute inset-0 z-0 bg-linear-to-b from-background/85 via-transparent to-background"
  ></div>

  <!-- ── Header ─────────────────────────────────────────── -->
  <!-- Fixed height (navbar clearance + one chip row) so the deck never shifts
       when the first save appears -->
  <header class="relative z-20 flex h-29 shrink-0 items-center justify-center px-4 pt-20">
    {#if savedCount > 0}
      <a
        href="/saved"
        class="glass flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-3 text-xs font-bold text-white/80 transition-colors hover:bg-white/10"
        in:scale={{ duration: 220, start: 0.85 }}
      >
        <Library size={14} class="text-spotify" />
        {savedCount} saved
      </a>
    {/if}
  </header>

  <!-- ── Deck ───────────────────────────────────────────── -->
  <div
    class="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4"
    bind:clientHeight={deckAreaH}
  >
    <div class="relative" style="width: {cardWidth}px; height: {cardWidth * TITLE_RATIO}px;">
      {#if tracks.length > 0}
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
              exitDir={dir}
              onCommit={commit}
              showHint={showHint && depth === 0}
            />
          </div>
        {/each}
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
        <div class="flex flex-col items-center gap-5 py-12 text-center" in:fade>
          <div class="glass grid h-20 w-20 place-items-center rounded-full">
            <Sparkles size={32} class="text-primary" />
          </div>
          <div>
            <h2 class="font-display text-3xl font-black text-white">That's the whole crate</h2>
            <p class="mt-1.5 text-white/50">You've been through every {categoryName} track.</p>
          </div>
          <div class="flex flex-col gap-3 pt-2 sm:flex-row">
            <a
              href="/categories"
              class="brand-gradient flex h-12 items-center justify-center rounded-full px-7 font-bold text-white shadow-lg shadow-primary/30 active:scale-95"
            >
              Browse genres
            </a>
            <a
              href="/saved"
              class="glass flex h-12 items-center justify-center rounded-full px-7 font-bold text-white/85 hover:bg-white/10 active:scale-95"
            >
              See your {savedCount || ''} saves
            </a>
          </div>
        </div>
      {/if}
    </div>
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
        <span>swipe left to pass or right to save </span>
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
