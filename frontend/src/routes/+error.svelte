<script lang="ts">
  import { page } from '$app/stores';
  import { fade, fly } from 'svelte/transition';
  import Aurora from '$lib/components/Aurora.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { Compass, Disc3, Home, ArrowLeft } from 'lucide-svelte';

  let status = $derived($page.status || 404);
  let is404 = $derived(status === 404);

  let title = $derived(
    is404
      ? 'Lost in the Mix'
      : status === 500
        ? 'Hit a Bad Note'
        : 'Something Skipped'
  );

  let description = $derived(
    is404
      ? 'The track, genre, or page you’re looking for doesn’t exist or was removed from the turntable.'
      : $page.error?.message ||
          'We ran into an unexpected hiccup while loading your groove. Let’s get you back on beat.'
  );

  const quickGenres = [
    { name: 'Explore', slug: 'explore' },
    { name: 'Pop', slug: 'pop' },
    { name: 'Rock', slug: 'rock' },
    { name: 'OPM Hits', slug: 'opm' },
    { name: 'Hip-Hop', slug: 'hip-hop' }
  ];
</script>

<SEO
  title="{status} — {title}"
  description={description}
  noindex={true}
/>

<div
  class="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 pt-20 pb-16 text-center select-none"
  in:fade={{ duration: 250 }}
>
  <Aurora intensity={0.5} />

  <!-- Ambient glowing spotlight -->
  <div
    class="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
    aria-hidden="true"
  ></div>

  <div
    class="relative z-10 mx-auto flex max-w-xl flex-col items-center"
    in:fly={{ y: 20, duration: 400 }}
  >
    <!-- Vinyl / Disc graphic with subtle neon aura -->
    <div class="relative mb-6 flex items-center justify-center">
      <div
        class="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse"
        aria-hidden="true"
      ></div>
      <div
        class="glass-strong relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 shadow-[0_0_35px_rgba(29,185,84,0.3)] sm:h-28 sm:w-28"
      >
        <Disc3
          size={52}
          class="text-primary animate-[spin_10s_linear_infinite]"
          strokeWidth={1.75}
        />
        <div class="absolute h-4 w-4 rounded-full bg-background border-2 border-white/30"></div>
      </div>
    </div>

    <!-- Error Status Code Pill -->
    <div
      class="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-mono font-bold tracking-widest text-primary uppercase backdrop-blur-md"
    >
      <span>Error {status}</span>
    </div>

    <!-- Main Headline -->
    <h1
      class="font-display text-3xl font-black tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
    >
      {title}
    </h1>

    <!-- Subtitle explanation -->
    <p class="mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base md:text-lg">
      {description}
    </p>

    <!-- Action Buttons -->
    <div class="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
      <a
        href="/discover/explore"
        class="brand-gradient flex h-12 w-full items-center justify-center gap-2 rounded-full px-7 font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03] active:scale-95 sm:w-auto"
      >
        <Compass size={18} />
        <span>Explore Songs</span>
      </a>

      <div class="flex w-full items-center justify-center gap-3 sm:w-auto">
        <a
          href="/categories"
          class="glass flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-6 font-bold text-white transition-all hover:bg-white/15 active:scale-95 sm:flex-initial sm:w-auto sm:px-7"
        >
          <Disc3 size={18} />
          <span>Browse Crates</span>
        </a>

        <a
          href="/"
          aria-label="Go home"
          class="glass grid h-12 w-12 shrink-0 place-items-center rounded-full text-white/70 transition-all hover:bg-white/15 hover:text-white active:scale-90"
        >
          <Home size={18} />
        </a>
      </div>
    </div>

    <!-- Quick Crate jump links -->
    <div class="mt-10 flex flex-col items-center gap-3">
      <span class="text-[11px] font-semibold tracking-[0.2em] text-white/35 uppercase">
        Or jump straight into
      </span>
      <div class="flex flex-wrap items-center justify-center gap-2">
        {#each quickGenres as genre}
          <a
            href="/discover/{genre.slug}"
            class="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/75 transition-all hover:border-primary/50 hover:bg-white/10 hover:text-white active:scale-95"
          >
            {genre.name}
          </a>
        {/each}
      </div>
    </div>
  </div>
</div>
