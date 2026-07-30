<script lang="ts">
  import { fade } from 'svelte/transition';
  import { Play } from 'lucide-svelte';
  import Aurora from '$lib/components/Aurora.svelte';

  let { data } = $props();

  // Deterministic per-tile gradient so image-less categories still look designed
  const fallbacks = [
    'linear-gradient(140deg,#16a34a,#065f46)',
    'linear-gradient(140deg,#1db954,#0f766e)',
    'linear-gradient(140deg,#334155,#0f172a)',
    'linear-gradient(140deg,#15803d,#1e293b)'
  ];
</script>

<svelte:head>
  <title>Categories — HearMeOut</title>
</svelte:head>

<div class="relative min-h-dvh overflow-hidden bg-black text-white" in:fade>
  <Aurora intensity={0.45} />

  <div
    class="relative z-10 mx-auto max-w-5xl px-4 pt-24 pb-[max(3rem,env(safe-area-inset-bottom))]"
  >
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-black md:text-5xl">Categories</h1>
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {#each data.categories as category, i (category.slug)}
        <a
          href={`/discover/${category.slug}`}
          class="group relative h-48 overflow-hidden rounded-3xl shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/20 active:scale-95"
        >
          <div
            class="absolute inset-0 z-10 bg-linear-to-t from-black/90 via-black/30 to-transparent"
          ></div>
          {#if category.image?.url}
            <!-- First row loads eagerly (i===0 is Lighthouse's LCP element on
                 this page); everything below the fold lazy-loads instead of
                 fighting it for bandwidth. -->
            <img
              src={category.image.url}
              alt={category.name}
              loading={i < 4 ? 'eager' : 'lazy'}
              fetchpriority={i === 0 ? 'high' : 'auto'}
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          {:else}
            <div
              class="absolute inset-0 h-full w-full"
              style="background: {fallbacks[i % fallbacks.length]}"
            ></div>
          {/if}

          <!-- Play affordance on hover -->
          <div
            class="absolute top-3 right-3 z-20 grid h-9 w-9 translate-y-1 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Play size={16} fill="currentColor" class="translate-x-px" />
          </div>

          <div class="absolute bottom-4 left-4 z-20 pr-4">
            <h3 class="text-xl font-bold tracking-tight text-white">{category.name}</h3>
          </div>
        </a>
      {/each}
    </div>

    {#if data.categories.length === 0}
      <div class="glass rounded-3xl px-6 py-16 text-center">
        <p class="text-gray-400">No categories yet — add some in the admin panel.</p>
      </div>
    {/if}
  </div>
</div>
