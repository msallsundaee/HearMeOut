<script lang="ts">
  import { fade } from 'svelte/transition';
  let { data } = $props();
</script>

<div class="min-h-screen bg-black text-white px-4 pb-12 pt-24" in:fade>
  <div class="max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-3xl md:text-5xl font-black">Categories</h1>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {#each data.categories as category}
        <a 
          href={`/discover/${category.slug}`}
          class="group relative h-48 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-primary/20 active:scale-95"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10"></div>
          {#if category.image?.url}
             <img src={category.image.url} alt={category.name} class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
          {:else}
             <div class="absolute inset-0 w-full h-full bg-gray-800"></div>
          {/if}
          <div class="absolute bottom-4 left-4 z-20 pr-4">
            <h3 class="text-xl font-bold text-white tracking-tight">{category.name}</h3>
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>
