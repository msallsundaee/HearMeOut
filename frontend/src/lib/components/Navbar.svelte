<script lang="ts">
  import { ArrowLeft, User, Flame } from 'lucide-svelte';
  import { page } from '$app/stores';
  
  let showBackButton = $derived($page.url.pathname !== '/');
  
  let title = $derived.by(() => {
    if ($page.url.pathname.startsWith('/discover/')) {
        const slug = $page.url.pathname.split('/').pop() || '';
        return slug.replace(/-/g, ' ').toUpperCase();
    }
    return 'HearMeOut';
  });
</script>

<nav class="fixed top-0 left-0 w-full z-50 p-4 pointer-events-none">
  <div class="max-w-5xl mx-auto flex items-center justify-between px-2 md:px-4">
    <div class="pointer-events-auto">
      {#if showBackButton}
        <button 
          onclick={() => history.back()} 
          class="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition shadow-lg border border-white/10"
        >
          <ArrowLeft size={24} />
        </button>
      {:else}
        <div class="w-10"></div> <!-- Spacer for layout balance -->
      {/if}
    </div>
    
    <div class="pointer-events-auto flex items-center space-x-2 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
      {#if title === 'HearMeOut'}
        <Flame size={18} class="text-primary animate-pulse" />
      {/if}
      <span class="font-black tracking-wide {title !== 'HearMeOut' ? 'text-white tracking-[0.2em] text-sm uppercase' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400'}">{title}</span>
    </div>

    <div class="pointer-events-auto">
      <button class="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition shadow-lg border border-white/10">
        <User size={24} />
      </button>
    </div>
  </div>
</nav>
