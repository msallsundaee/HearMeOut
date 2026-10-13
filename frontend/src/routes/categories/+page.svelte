<script lang="ts">
  import { fade } from 'svelte/transition';
  import { Play, Search, X } from 'lucide-svelte';
  import Aurora from '$lib/components/Aurora.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { getCanonicalUrl } from '$lib/config/site';

  let { data } = $props();
  let searchQuery = $state('');

  let filteredCategories = $derived.by(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return data.categories;
    return data.categories.filter((c: any) =>
      c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  });

  // Deterministic per-tile gradient so image-less categories still look designed
  const fallbacks = [
    'linear-gradient(140deg,#16a34a,#065f46)',
    'linear-gradient(140deg,#1db954,#0f766e)',
    'linear-gradient(140deg,#334155,#0f172a)',
    'linear-gradient(140deg,#15803d,#1e293b)'
  ];

  let collectionSchema = $derived({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Music Categories & Genres — HearMeOut',
    description:
      'Explore music genres from Pop to Rock, Indie to Hip-Hop. Swipe and preview songs in your favorite category.',
    url: getCanonicalUrl('/categories'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: data.categories.map((c: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: getCanonicalUrl(`/discover/${c.slug}`),
        name: c.name
      }))
    }
  });

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' }
  ];
</script>

<SEO
  title="Music Categories & Genres"
  description="Explore music crates across Pop, Hip-Hop, Indie, Rock, EDM, and more. Preview 30-second clips and swipe to save your favorite songs."
  pathname="/categories"
  schema={collectionSchema}
  breadcrumbs={breadcrumbs}
/>

<div class="relative min-h-dvh overflow-hidden bg-black text-white" in:fade>
  <Aurora intensity={0.45} />

  <div
    class="relative z-10 mx-auto max-w-5xl px-4 pt-24 pb-[max(3rem,env(safe-area-inset-bottom))]"
  >
    <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black md:text-5xl">Categories</h1>
        <p class="mt-1 text-sm text-gray-400">
          Showing {filteredCategories.length} {filteredCategories.length === 1 ? 'crate' : 'crates'}
        </p>
      </div>

      <div class="relative w-full sm:w-72 md:w-80">
        <Search class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search genres & vibes..."
          class="w-full rounded-full bg-white/10 border border-white/10 pl-11 pr-10 py-2.5 text-sm text-white placeholder-gray-400 backdrop-blur-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
        {#if searchQuery}
          <button
            onclick={() => (searchQuery = '')}
            aria-label="Clear search"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        {/if}
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {#each filteredCategories as category, i (category.slug)}
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

    {#if filteredCategories.length === 0 && data.categories.length > 0}
      <div class="glass flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center">
        <p class="text-lg font-bold text-white">No crates found for “{searchQuery}”</p>
        <p class="mt-1 text-sm text-gray-400">Try searching for Pop, Rock, R&B, OPM, or Explore.</p>
        <button
          onclick={() => (searchQuery = '')}
          class="mt-5 rounded-full bg-white/10 px-6 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
        >
          Clear search
        </button>
      </div>
    {:else if data.categories.length === 0}
      <div class="glass rounded-3xl px-6 py-16 text-center">
        <p class="text-gray-400">No categories yet — add some in the admin panel.</p>
      </div>
    {/if}
  </div>
</div>
