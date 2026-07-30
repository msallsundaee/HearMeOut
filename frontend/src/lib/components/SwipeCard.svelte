<script lang="ts">
  import { Play, Heart, X, Hand } from 'lucide-svelte';
  import Equalizer from '$lib/components/Equalizer.svelte';

  let {
    track,
    isActive = false,
    /** Set by the parent to fling the card off-screen: 'left' | 'right' | null */
    exitDir = null,
    /** Fired the moment a gesture crosses the commit threshold */
    onCommit,
    /** Show the one-time drag hint */
    showHint = false,
    /** Lets the parent patch its copy of this track once a preview resolves,
        so saving it afterwards carries a working URL too */
    onPreviewResolved
  }: {
    track: any;
    isActive?: boolean;
    exitDir?: 'left' | 'right' | null;
    onCommit: (dir: 'left' | 'right') => void;
    showHint?: boolean;
    onPreviewResolved?: (url: string) => void;
  } = $props();

  // ── Gesture state ───────────────────────────────────────
  let dx = $state(0);
  let dy = $state(0);
  let dragging = $state(false);
  let cardEl = $state<HTMLElement | null>(null);
  let cardWidth = $state(320);

  // Deliberately plain (non-reactive) — read inside $effect without creating a dependency
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastT = 0;
  let velocityX = 0;
  let liftAtRelease = 0;
  let hintDismissed = $state(false);

  /** Distance needed to commit, or a hard enough flick at any distance. */
  const FLICK_VELOCITY = 0.55; // px per ms
  let threshold = $derived(Math.max(84, cardWidth * 0.28));

  // How far through the gesture we are, signed: -1 (skip) … +1 (save)
  let progress = $derived(Math.max(-1, Math.min(1, dx / threshold)));
  let rotation = $derived(Math.max(-16, Math.min(16, dx * 0.055)));

  let saveTint = $derived(Math.max(0, progress));
  let skipTint = $derived(Math.max(0, -progress));

  /** Front card, or one mid-fling: keep it fully dressed so the exit looks whole. */
  let isFront = $derived(isActive || !!exitDir);

  /**
   * Step the title down a size as it gets longer so it always fits the reserved
   * two lines in full. Beats truncating — Spotify titles carry meaning in the
   * tail ("- 2019 Remaster", "(feat. …)").
   */
  let titleSize = $derived.by(() => {
    const len = (track.title || '').length;
    if (len > 46) return 'text-sm sm:text-base';
    if (len > 34) return 'text-base sm:text-lg';
    if (len > 22) return 'text-lg sm:text-xl';
    return 'text-2xl';
  });

  function measure() {
    if (cardEl) cardWidth = cardEl.offsetWidth || 320;
  }

  function handlePointerDown(e: PointerEvent) {
    if (!isActive || exitDir) return;
    // Let the play button and other controls handle their own taps
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

    measure();
    dragging = true;
    hintDismissed = true;
    startX = lastX = e.clientX;
    startY = e.clientY;
    lastT = e.timeStamp;
    velocityX = 0;
    cardEl?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragging) return;

    const dt = e.timeStamp - lastT;
    if (dt > 0) {
      // Smooth the velocity so a single jittery sample can't trigger a fling
      velocityX = 0.7 * ((e.clientX - lastX) / dt) + 0.3 * velocityX;
      lastX = e.clientX;
      lastT = e.timeStamp;
    }

    dx = e.clientX - startX;
    // Damp vertical travel — this is a horizontal gesture, the lift is just flavour
    dy = (e.clientY - startY) * 0.35;
    liftAtRelease = dy;
  }

  function handlePointerUp() {
    if (!dragging) return;
    dragging = false;

    const flicked = Math.abs(velocityX) > FLICK_VELOCITY;
    const dragged = Math.abs(dx) > threshold;
    // A flick only counts when it agrees with the direction already travelled
    const agrees = Math.sign(velocityX) === Math.sign(dx);

    if (dragged || (flicked && agrees && Math.abs(dx) > 24)) {
      onCommit(dx > 0 ? 'right' : 'left');
    } else {
      dx = 0;
      dy = 0;
      liftAtRelease = 0;
    }
  }

  // ── Exit animation, driven by the parent ────────────────
  $effect(() => {
    if (!exitDir) return;
    dragging = false;
    const sign = exitDir === 'right' ? 1 : -1;
    // Keep whatever lift the drag had, then throw it clear of the viewport.
    // `liftAtRelease` is plain state on purpose: reading `dy` here would make
    // this effect depend on a value it also writes.
    dy = liftAtRelease - 60;
    dx = sign * (window.innerWidth + cardWidth);
    if (audioEl) audioEl.pause();
    navigator.vibrate?.(exitDir === 'right' ? 18 : 10);
  });

  let transition = $derived(
    dragging
      ? 'none'
      : exitDir
        ? 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)'
        : 'transform 520ms cubic-bezier(0.34, 1.4, 0.64, 1)'
  );

  // ── Preview audio ───────────────────────────────────────
  let audioEl = $state<HTMLAudioElement | null>(null);
  let isPlaying = $state(false);
  let isBuffering = $state(false);
  let needsTap = $state(false);

  // Almost no track arrives from Spotify with a preview URL any more, so this
  // starts 'pending' for nearly every card and gets resolved lazily below —
  // only once a card is actually the one on top, not for the whole stack.
  // Reading only the initial value of `track` is intentional: the parent's
  // {#each ... (track.id)} keying means this component is destroyed and
  // recreated if the track it's showing ever changes, never reused in place.
  // svelte-ignore state_referenced_locally
  let resolvedPreviewUrl = $state(track.previewUrl || '');
  // svelte-ignore state_referenced_locally
  let previewState = $state<'ready' | 'pending' | 'none'>(track.previewUrl ? 'ready' : 'pending');
  let fetchingPreview = false;

  $effect(() => {
    if (!isActive || previewState !== 'pending' || fetchingPreview) return;
    fetchingPreview = true;
    fetch(
      `/api/preview?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`
    )
      .then((r) => (r.ok ? r.json() : { previewUrl: '' }))
      .then(({ previewUrl }) => {
        if (previewUrl) {
          resolvedPreviewUrl = previewUrl;
          previewState = 'ready';
          onPreviewResolved?.(previewUrl);
        } else {
          previewState = 'none';
        }
      })
      .catch(() => {
        previewState = 'none';
      })
      .finally(() => {
        fetchingPreview = false;
      });
  });

  $effect(() => {
    if (!audioEl) return;

    if (isActive && !exitDir) {
      isBuffering = true;
      audioEl
        .play()
        .then(() => {
          isPlaying = true;
          needsTap = false;
        })
        .catch(() => {
          // Autoplay blocked until the user interacts — nudge them instead
          isPlaying = false;
          needsTap = true;
        })
        .finally(() => {
          isBuffering = false;
        });
    } else {
      audioEl.pause();
      audioEl.currentTime = 0;
      isPlaying = false;
      isBuffering = false;
    }
  });

  function togglePlay() {
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
      isPlaying = false;
    } else {
      audioEl.play().then(
        () => {
          isPlaying = true;
          needsTap = false;
        },
        () => (isPlaying = false)
      );
    }
  }

</script>

<svelte:window onresize={measure} />

<div
  bind:this={cardEl}
  role="group"
  aria-roledescription="Swipeable track card — drag left to skip, right to save"
  class="absolute inset-x-0 flex w-full flex-col items-center will-change-transform select-none {isActive &&
  !exitDir
    ? 'cursor-grab active:cursor-grabbing'
    : ''}"
  style="transform: translate3d({dx}px, {dy}px, 0) rotate({rotation}deg) scale({dragging
    ? 1.02
    : 1}); transition: {transition}; touch-action: none;"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
>
  <!-- Colour bleeding out from the artwork — the card feels lit by the song -->
  {#if isFront}
    <div
      class="pointer-events-none absolute -inset-6 -z-10 overflow-hidden rounded-[3rem] opacity-60 blur-2xl"
      aria-hidden="true"
    >
      <img src={track.albumArt} alt="" class="h-full w-full scale-125 object-cover" />
    </div>
  {/if}

  <!-- ── Artwork ─────────────────────────────────────────── -->
  <div
    class="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-surface shadow-[0_28px_60px_-18px_rgba(0,0,0,0.95)]"
  >
    <img
      src={track.albumArt}
      alt="{track.title} by {track.artist}"
      draggable="false"
      class="pointer-events-none h-full w-full object-cover"
    />

    <!-- Bottom scrim so the chips stay readable on bright covers -->
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/75 to-transparent"
    ></div>

    <!-- Directional colour wash, tracking the gesture -->
    <div
      class="pointer-events-none absolute inset-0 bg-save mix-blend-overlay"
      style="opacity: {saveTint * 0.75}"
    ></div>
    <div
      class="pointer-events-none absolute inset-0 bg-skip mix-blend-overlay"
      style="opacity: {skipTint * 0.75}"
    ></div>

    <!-- ── Gesture badges ───────────────────────────────── -->
    <div
      class="pointer-events-none absolute top-5 left-5 flex items-center gap-2 rounded-2xl border-[3px] border-save bg-black/35 px-3.5 py-1.5 text-save backdrop-blur-sm"
      style="opacity: {saveTint}; transform: rotate(-12deg) scale({0.8 + saveTint * 0.2});
             box-shadow: 0 0 {24 * saveTint}px rgba(29,185,84,{0.55 * saveTint});"
    >
      <Heart size={20} fill="currentColor" />
      <span class="font-display text-xl font-black tracking-widest">SAVE</span>
    </div>

    <div
      class="pointer-events-none absolute top-5 right-5 flex items-center gap-2 rounded-2xl border-[3px] border-skip bg-black/35 px-3.5 py-1.5 text-skip backdrop-blur-sm"
      style="opacity: {skipTint}; transform: rotate(12deg) scale({0.8 + skipTint * 0.2});
             box-shadow: 0 0 {24 * skipTint}px rgba(239,68,68,{0.55 * skipTint});"
    >
      <X size={20} strokeWidth={3} />
      <span class="font-display text-xl font-black tracking-widest">SKIP</span>
    </div>

    <!-- ── Preview control: play icon, or a soundwave while playing ─── -->
    {#if previewState === 'ready'}
      <button
        data-no-drag
        aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
        class="absolute right-3.5 bottom-3.5 grid h-11 w-11 place-items-center rounded-full bg-primary text-white shadow-lg shadow-black/60 transition-transform hover:bg-primary/90 active:scale-90 {needsTap
          ? 'animate-pulse'
          : ''}"
        onpointerdown={(e) => e.stopPropagation()}
        onclick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      >
        {#if isBuffering}
          <span
            class="block h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/25 border-t-white"
          ></span>
        {:else if isPlaying}
          <Equalizer bars={4} playing class="h-3.5 w-3.5" color="#fff" />
        {:else}
          <Play size={19} fill="currentColor" class="translate-x-px" />
        {/if}
      </button>

      <audio
        bind:this={audioEl}
        src={resolvedPreviewUrl}
        preload={isActive ? 'auto' : 'none'}
        onended={() => (isPlaying = false)}
        onwaiting={() => (isBuffering = true)}
        onplaying={() => {
          isBuffering = false;
          isPlaying = true;
        }}
        oncanplay={() => (isBuffering = false)}
      ></audio>
    {:else if previewState === 'pending'}
      <!-- Looking up a preview for this card specifically, not the whole
           deck — see the fetch in the $effect above -->
      <div
        class="absolute right-3.5 bottom-3.5 grid h-11 w-11 place-items-center rounded-full bg-primary/40 text-white shadow-lg shadow-black/60"
      >
        <span
          class="block h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/25 border-t-white"
        ></span>
      </div>
    {:else}
      <div
        class="glass-strong pointer-events-none absolute bottom-4 left-4 rounded-full px-3.5 py-2 text-[11px] font-bold tracking-[0.12em] text-white/60 uppercase"
      >
        No preview
      </div>
    {/if}

    <!-- One-time hint for first-timers -->
    {#if showHint && !hintDismissed && isActive && !dragging}
      <div
        class="animate-pop pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2"
      >
        <div class="glass-strong flex items-center gap-2.5 rounded-full px-4 py-2.5">
          <Hand size={18} class="text-white animate-bounce" />
          <span class="text-xs font-semibold text-white">Drag the cover left or right</span>
        </div>
      </div>
    {/if}
  </div>

  <!-- ── Track meta ──────────────────────────────────────── -->
  <!-- Nothing here truncates: long titles step down a size instead, so a
       "… - 2019 Remaster" suffix still wraps onto a second line in full. -->
  <div
    class="pointer-events-none w-full px-1 pt-4 text-center transition-opacity duration-300 {isFront
      ? 'opacity-100'
      : 'opacity-0'}"
  >
    <h2
      class="font-display leading-[1.12] font-black break-words text-white {titleSize} text-pretty"
    >
      {track.title}
    </h2>
    <p class="mt-0.5 text-sm font-medium break-words text-white/55 sm:text-base">
      {track.artist}
    </p>
  </div>
</div>
