<script lang="ts">
  import SwipeCard from '$lib/components/SwipeCard.svelte';
  import { fade } from 'svelte/transition';
  import { savedTracks } from '$lib/stores/savedTracks';
  
  let { data } = $props();
  
  let tracks = $state([...data.tracks]);
  let isLoadingMore = $state(false);
  
  async function fetchMoreTracks() {
    if (isLoadingMore) return;
    isLoadingMore = true;
    try {
      const res = await fetch(`/api/tracks?slug=${data.categorySlug}`);
      if (res.ok) {
        const newTracks = await res.json();
        // Prepend new tracks to the bottom of the deck so they appear under the current cards
        tracks = [...newTracks, ...tracks];
      }
    } catch (e) {
      console.error('Failed to fetch more tracks', e);
    }
    isLoadingMore = false;
  }

  async function handleSwipe(direction: 'left'|'right', track: any) {
    if (direction === 'right') {
      savedTracks.saveTrack(track);
      
      // Still log swipe to backend asynchronously
      fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track, direction })
      }).catch(e => console.error('Error saving swipe log', e));
    }

    // Remove track from stack (it was swiped away)
    tracks = tracks.filter(t => t.id !== track.id);

    // Infinite scrolling: if we are running low on tracks, fetch more in the background!
    if (tracks.length <= 3) {
      fetchMoreTracks();
    }
  }
</script>

<div class="h-[100dvh] bg-black text-white pt-20 px-4 flex flex-col overflow-hidden relative" in:fade>
  {#if tracks.length > 0}
    <div class="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <img src={tracks[tracks.length-1].albumArt} class="w-full h-full object-cover blur-3xl scale-110" alt="Background" />
    </div>
  {/if}

  <!-- Deck Container -->
  <div class="flex-1 w-full flex items-center justify-center min-h-0 z-10 mt-4 md:mt-0">
    <div class="relative w-[85vw] max-w-[300px] sm:max-w-sm md:max-w-md aspect-[3/4] perspective-1000">
      {#if tracks.length > 0}
        {#each tracks as track, index (track.id)}
          {#if index >= tracks.length - 3} <!-- Render only top 3 cards for performance -->
            <div class="absolute w-full flex justify-center origin-bottom transition-all" style="z-index: {index}; transform: scale({1 - (tracks.length - 1 - index) * 0.05}) translateY({(tracks.length - 1 - index) * -20}px);">
              <SwipeCard {track} onSwipe={handleSwipe} isActive={index === tracks.length - 1} />
            </div>
          {/if}
        {/each}
      {:else if isLoadingMore}
        <div class="flex flex-col items-center justify-center space-y-6 mt-20" in:fade>
          <div class="relative w-20 h-20">
            <div class="absolute inset-0 rounded-full border-4 border-white/10"></div>
            <div class="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <h2 class="text-xl font-medium text-gray-400">Loading new tracks...</h2>
        </div>
      {:else}
        <div class="text-center space-y-6 animate-pulse mt-20">
          <h2 class="text-3xl font-black text-gray-300">You've seen them all!</h2>
          <p class="text-gray-500">Check out other categories for more music.</p>
          <a href="/categories" class="inline-block bg-primary text-white py-3 px-8 rounded-full font-bold shadow-lg shadow-primary/30">Browse Categories</a>
        </div>
      {/if}
    </div>
  </div>
  
  <div class="flex flex-col items-center z-10 pb-4 md:pb-8 shrink-0">
    <div class="py-4 md:py-6 flex justify-center items-center space-x-8">
      <button class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-900/80 border-2 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl backdrop-blur" onclick={() => tracks.length && handleSwipe('left', tracks[tracks.length-1])}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      <button class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-900/80 border-2 border-[#1DB954] text-[#1DB954] flex items-center justify-center hover:bg-[#1DB954] hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl backdrop-blur" onclick={() => tracks.length && handleSwipe('right', tracks[tracks.length-1])}>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      </button>
    </div>
    <p class="text-gray-500 text-sm font-medium tracking-wide uppercase">Swipe left to skip &middot; Swipe right to save</p>
  </div>
</div>
