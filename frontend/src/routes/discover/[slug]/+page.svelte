<script lang="ts">
  import SwipeCard from '$lib/components/SwipeCard.svelte';
  import { fade } from 'svelte/transition';
  
  let { data } = $props();
  
  let tracks = $state([...data.tracks]);
  let showLoginPrompt = $state(false);
  
  async function handleSwipe(direction: 'left'|'right', track: any) {
    console.log(`Swiped ${direction} on ${track.title}`);
    
    const res = await fetch('/api/swipe', {
      method: 'POST',
      body: JSON.stringify({ track, direction }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.status === 401 && direction === 'right') {
      showLoginPrompt = true;
      // Put the track back to allow saving later? 
      // For now we'll just let them skip it or they lose this save, 
      // but they can login and their next swipes will be saved.
    }
    
    // Remove track from stack
    tracks = tracks.filter(t => t.id !== track.id);
  }
</script>

<div class="min-h-screen bg-black text-white p-4 flex flex-col overflow-hidden relative" in:fade>
  <!-- Background blur of current track -->
  {#if tracks.length > 0}
    <div class="absolute inset-0 z-0 opacity-20 pointer-events-none">
      <img src={tracks[tracks.length-1].albumArt} class="w-full h-full object-cover blur-3xl scale-110" alt="Background" />
    </div>
  {/if}

  <div class="flex items-center justify-between py-4 z-10">
    <a href="/categories" class="text-gray-400 hover:text-white transition-colors bg-gray-900/50 p-2 rounded-full backdrop-blur">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </a>
    <h1 class="text-sm font-bold uppercase tracking-[0.2em] bg-gray-900/50 px-4 py-2 rounded-full backdrop-blur">{data.categorySlug.replace('-', ' ')}</h1>
    <div class="w-10"></div> <!-- spacer -->
  </div>
  
  <div class="flex-1 relative flex items-center justify-center w-full max-w-sm mx-auto z-10">
    {#if tracks.length > 0}
      {#each tracks as track, index (track.id)}
        {#if index >= tracks.length - 3} <!-- Render only top 3 cards for performance -->
          <div class="absolute w-full flex justify-center origin-bottom transition-all" style="z-index: {index}; transform: scale({1 - (tracks.length - 1 - index) * 0.05}) translateY({(tracks.length - 1 - index) * -20}px);">
            <SwipeCard {track} onSwipe={handleSwipe} />
          </div>
        {/if}
      {/each}
    {:else}
      <div class="text-center space-y-6 animate-pulse">
        <h2 class="text-3xl font-black text-gray-300">You've seen them all!</h2>
        <p class="text-gray-500">Check out other categories for more music.</p>
        <a href="/categories" class="inline-block bg-primary text-white py-3 px-8 rounded-full font-bold shadow-lg shadow-primary/30">Browse Categories</a>
      </div>
    {/if}
  </div>
  
  <div class="py-6 flex justify-center items-center space-x-8 z-10">
    <button class="w-16 h-16 rounded-full bg-gray-900/80 border-2 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl backdrop-blur" onclick={() => tracks.length && handleSwipe('left', tracks[tracks.length-1])}>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
    <button class="w-16 h-16 rounded-full bg-gray-900/80 border-2 border-[#1DB954] text-[#1DB954] flex items-center justify-center hover:bg-[#1DB954] hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-xl backdrop-blur" onclick={() => tracks.length && handleSwipe('right', tracks[tracks.length-1])}>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
    </button>
  </div>

  <!-- Login Prompt Modal -->
  {#if showLoginPrompt}
    <div class="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" in:fade out:fade>
      <div class="bg-gray-900 border border-gray-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
        <div class="bg-primary/20 p-4 rounded-full inline-block mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1DB954" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-white">Save your discoveries</h2>
        <p class="text-gray-400">Connect your Spotify account to save liked tracks directly to your library.</p>
        
        <div class="space-y-3 pt-4">
          <a href="/api/auth/login" class="block w-full py-3 px-6 rounded-full bg-[#1DB954] text-black font-bold hover:scale-105 transition-transform">Connect Spotify</a>
          <button onclick={() => showLoginPrompt = false} class="block w-full py-3 px-6 rounded-full bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors">Maybe Later</button>
        </div>
      </div>
    </div>
  {/if}
</div>
