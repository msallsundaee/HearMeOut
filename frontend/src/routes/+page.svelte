<script lang="ts">
  import { Music, Flame, User, Headphones, Heart, ListMusic, Mail } from 'lucide-svelte';
  import { page } from '$app/stores';
  import { preloadData } from '$app/navigation';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  let { data } = $props();

  // Rotating tagline — replaces a single static line, so only one phrase is
  // ever on screen at a time
  const hooks = [
    'Discover new music with a swipe. Smash or Pass!',
    'Your next favourite song is one swipe away.',
    'Stop scrolling playlists. Start hearing music.',
    '30 seconds is all it takes to know.',
    'Swipe right to keep it. Left to forget it.',
    'Every genre is a bottomless crate.'
  ];
  let hookIndex = $state(0);

  // Sized down per phrase length so every one fits a single line at any
  // viewport width — `whitespace-nowrap` guarantees no wrap, this just keeps
  // longer phrases from clipping instead.
  function hookSize(text: string) {
    const len = text.length;
    if (len <= 36) return 'text-lg sm:text-2xl md:text-3xl';
    if (len <= 44) return 'text-base sm:text-xl md:text-2xl';
    return 'text-sm sm:text-lg md:text-xl';
  }

  const year = new Date().getFullYear();

  onMount(() => {
    // Deferred to idle time — firing this immediately competed on the network
    // with the page's own LCP image (Lighthouse flagged the resulting request
    // chain), for a prefetch that's only there to make the *next* click faster.
    // requestIdleCallback isn't in this project's configured DOM lib, and it's
    // Baseline-supported everywhere but Safari, so a narrow local type for the
    // feature check is enough here rather than pulling in the types project-wide.
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleWindow = window as IdleWindow;

    let cancelPreload: () => void;
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(() => preloadData('/categories'));
      cancelPreload = () => idleWindow.cancelIdleCallback?.(id);
    } else {
      const id = window.setTimeout(() => preloadData('/categories'), 200);
      cancelPreload = () => window.clearTimeout(id);
    }

    const rotate = setInterval(() => {
      hookIndex = (hookIndex + 1) % hooks.length;
    }, 3200);

    return () => {
      clearInterval(rotate);
      cancelPreload();
    };
  });

  /**
   * Scattered around the edges so the hero copy stays clear in the middle.
   * `hide` drops the tighter ones on small screens.
   */
  const spots = [
    { top: '6%', left: '4%', size: 128, rot: -13, dur: 9, delay: 0, hide: false },
    { top: '20%', left: '22%', size: 84, rot: 9, dur: 11, delay: 1.4, hide: true },
    { top: '4%', left: '68%', size: 104, rot: 11, dur: 10, delay: 0.7, hide: false },
    { top: '16%', left: '86%', size: 76, rot: -8, dur: 12, delay: 2.1, hide: true },
    { top: '58%', left: '2%', size: 92, rot: 7, dur: 10.5, delay: 1.1, hide: true },
    { top: '74%', left: '14%', size: 116, rot: -10, dur: 9.5, delay: 0.3, hide: false },
    { top: '62%', left: '80%', size: 96, rot: 12, dur: 11.5, delay: 1.8, hide: true },
    { top: '80%', left: '66%', size: 132, rot: -6, dur: 10, delay: 0.9, hide: false },
    { top: '40%', left: '92%', size: 68, rot: 14, dur: 12.5, delay: 2.4, hide: true },
    { top: '36%', left: '-3%', size: 72, rot: -14, dur: 11, delay: 1.6, hide: true }
  ];

  // Cover art for the vinyl sleeve, plus the rest for the floating collage
  let sleeve = $derived(data.covers?.[0] ?? null);
  let collage = $derived(data.covers?.slice(1) ?? []);
</script>

<svelte:head>
  <title>HearMeOut — discover new music with a swipe</title>
</svelte:head>

<div class="relative flex min-h-dvh flex-col overflow-hidden bg-black text-white">
  <!-- Background gradient decorations -->
  <div
    class="animate-drift pointer-events-none absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-3xl"
  ></div>
  <div
    class="animate-drift-slow pointer-events-none absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-spotify/20 blur-3xl"
  ></div>

  <!-- ── Floating album covers ──────────────────────────── -->
  <div class="pointer-events-none absolute inset-0" aria-hidden="true">
    {#each spots as spot, i}
      {@const cover = collage[i % Math.max(1, collage.length)]}
      <div
        class="animate-float absolute will-change-transform {spot.hide ? 'hidden sm:block' : ''}"
        style="top: {spot.top}; left: {spot.left}; width: {spot.size}px;
               animation-duration: {spot.dur}s; animation-delay: -{spot.delay}s;"
      >
        <div
          class="aspect-square w-full overflow-hidden rounded-lg border border-white/10 shadow-2xl shadow-black/80"
          style="transform: rotate({spot.rot}deg);"
        >
          {#if cover}
            <img
              src={cover.url}
              alt=""
              loading="lazy"
              class="h-full w-full object-cover opacity-45 saturate-125"
            />
          {:else}
            <div class="h-full w-full bg-linear-to-br from-gray-800 to-gray-900"></div>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <!-- ── Spinning vinyl, half-tucked behind its sleeve ──── -->
  <div
    class="pointer-events-none absolute -right-24 bottom-[-10%] hidden md:block lg:-right-16"
    aria-hidden="true"
  >
    <div class="relative h-[26rem] w-[26rem]">
      <!-- The disc -->
      <div
        class="animate-spin-slow absolute top-8 left-24 h-72 w-72 rounded-full opacity-70 shadow-2xl shadow-black"
        style="background:
          repeating-radial-gradient(circle at center, #14151a 0 2px, #0a0b0e 2px 6px);"
      >
        <div
          class="absolute inset-[36%] overflow-hidden rounded-full brand-gradient shadow-inner"
        >
          {#if sleeve}
            <img src={sleeve.url} alt="" class="h-full w-full object-cover opacity-80" />
          {/if}
        </div>
        <div class="absolute inset-[48.5%] rounded-full bg-black"></div>
        <!-- Sheen across the grooves -->
        <div
          class="absolute inset-0 rounded-full"
          style="background: linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.12) 50%, transparent 62%);"
        ></div>
      </div>

      <!-- The sleeve in front of it -->
      <div
        class="absolute top-14 left-0 h-60 w-60 overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black"
      >
        {#if sleeve}
          <!-- Lighthouse's largest element on this page — hint the browser to
               fetch it first rather than after the (lower-priority) collage -->
          <img
            src={sleeve.url}
            alt=""
            fetchpriority="high"
            class="h-full w-full object-cover opacity-70"
          />
        {:else}
          <div class="h-full w-full bg-linear-to-br from-gray-800 to-gray-900"></div>
        {/if}
        <div class="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"></div>
      </div>
    </div>
  </div>

  <!-- Scrim: pulls the collage back so the hero copy always reads first -->
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_center,rgba(0,0,0,0.92)_35%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.75)_100%)]"
  ></div>
  <div class="grain"></div>

  <!-- ── Hero ───────────────────────────────────────────── -->
  <!-- pt clears the fixed navbar (and the notch) so the flame never tucks under it -->
  <main
    class="animate-rise relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 pt-[max(6rem,calc(env(safe-area-inset-top)+5.5rem))] pb-6 text-center"
  >
    <div class="mb-6 flex justify-center">
      <div class="animate-bounce rounded-full bg-primary p-4 shadow-2xl shadow-primary/50 md:p-6">
        <Flame class="h-16 w-16 text-white md:h-24 md:w-24" />
      </div>
    </div>

    <h1
      class="text-gradient mb-4 text-6xl font-black tracking-tighter drop-shadow-2xl md:text-8xl"
    >
      HearMeOut
    </h1>
    <!-- Rotating tagline. Always one line — whitespace-nowrap plus a
         length-based font size (hookSize) so a long phrase shrinks instead
         of wrapping. Fixed height reserved at the largest tier's line-height
         so the crossfade never reflows the buttons below it.
         w-full (not mx-auto) is load-bearing here: this div is a flex item
         with no in-flow children (the <p> is absolute), and auto margins on
         a flex item override stretch — it was collapsing to content width,
         which is what caused the one-word-per-line wrapping before. -->
    <div class="relative mx-auto mb-2 h-9 w-full max-w-xl sm:h-11 md:h-14">
      {#key hookIndex}
        <p
          class="absolute inset-0 flex items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap text-gray-400 {hookSize(
            hooks[hookIndex]
          )}"
          in:fade={{ duration: 450, delay: 250 }}
          out:fade={{ duration: 250 }}
        >
          {hooks[hookIndex]}
        </p>
      {/key}
    </div>

    {#if $page.url.searchParams.get('error')}
      <div
        class="mb-6 rounded-lg border border-red-500 bg-red-500/20 px-4 py-3 text-red-400"
        role="alert"
      >
        <p>Authentication failed. Please try again.</p>
      </div>
    {/if}

    <div class="mx-auto max-w-md space-y-3 pt-6 sm:space-y-4 sm:pt-8">
      <a
        href="/categories"
        class="flex w-full transform items-center justify-center rounded-full bg-white px-6 py-3 text-base font-bold text-black shadow-lg transition-all hover:scale-105 hover:bg-gray-200 active:scale-95 sm:py-4 sm:text-lg"
      >
        <Flame class="mr-2" size={20} />
        Start Exploring
      </a>
      {#if !$page.data.hasSpotifyToken}
        <a
          href="/api/auth/login"
          class="flex w-full transform items-center justify-center rounded-full border border-[#1DB954] bg-[#1DB954]/10 px-6 py-3 text-base font-bold text-[#1DB954] shadow-lg transition-all hover:scale-105 hover:bg-[#1DB954]/20 active:scale-95 sm:py-4 sm:text-lg"
        >
          <Music class="mr-2" size={20} />
          Connect Spotify
        </a>
      {:else}
        <div
          class="flex w-full items-center justify-center rounded-full border border-[#1DB954]/50 bg-[#1DB954]/20 px-6 py-3 text-base font-bold text-[#1DB954] opacity-80 shadow-lg sm:py-4 sm:text-lg"
        >
          <Music class="mr-2" size={20} />
          Spotify Connected
        </div>
      {/if}

      {#if !$page.data.isLoggedIn}
        <!-- Always side by side, mobile included -->
        <div class="flex gap-3 border-t border-gray-800 pt-5 sm:gap-4 sm:pt-6">
          <a
            href="/login"
            class="flex flex-1 transform items-center justify-center rounded-full border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-800 active:scale-95 sm:px-6 sm:py-4 sm:text-base"
          >
            <User class="mr-2 shrink-0" size={18} />
            Sign In
          </a>
          <a
            href="/register"
            class="flex flex-1 transform items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-bold text-black shadow-lg transition-all hover:scale-105 hover:bg-primary/90 active:scale-95 sm:px-6 sm:py-4 sm:text-base"
          >
            Sign Up
          </a>
        </div>
      {/if}

      <!-- ── What this actually is, in three beats ────────── -->
      <ul class="mt-8 grid grid-cols-3 gap-2 border-t border-gray-800 pt-6 text-center">
        <li class="flex flex-col items-center gap-2">
          <Headphones size={20} class="text-primary" />
          <span class="text-xs leading-snug font-semibold text-gray-300">
            Hear a 30s preview
          </span>
        </li>
        <li class="flex flex-col items-center gap-2">
          <Heart size={20} class="text-primary" />
          <span class="text-xs leading-snug font-semibold text-gray-300">
            Swipe right to keep
          </span>
        </li>
        <li class="flex flex-col items-center gap-2">
          <ListMusic size={20} class="text-[#1DB954]" />
          <span class="text-xs leading-snug font-semibold text-gray-300">
            Send it to Spotify
          </span>
        </li>
      </ul>

      <p class="mt-6 text-xs text-gray-500">
        No account needed to start. Using Spotify to customize your experience and save your
        liked tracks.
      </p>
    </div>
  </main>

  <!-- ── Credits ────────────────────────────────────────── -->
  <footer
    class="relative z-10 flex shrink-0 flex-col items-center gap-3 border-t border-gray-800/60 px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center"
  >
    <p class="text-xs text-gray-500">
      &copy; {year} HearMeOut &middot; Developed by
      <span class="font-semibold text-gray-300">Bea Clarise</span>
    </p>
    <div class="flex items-center gap-3">
      <a
        href="mailto:bacaling.beaclarise@gmail.com"
        aria-label="Email Bea Clarise"
        class="grid h-9 w-9 place-items-center rounded-full border border-gray-800 text-gray-500 transition-colors hover:border-primary hover:text-primary"
      >
        <Mail size={16} />
      </a>
    </div>
  </footer>
</div>
