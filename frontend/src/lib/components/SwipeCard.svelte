<script lang="ts">
  import { spring } from 'svelte/motion';
  import { Play, Pause } from 'lucide-svelte';
  
  let { track, onSwipe, isActive = false } = $props();
  
  let offset = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.4 });
  let isDragging = $state(false);
  let startX = 0;
  let startY = 0;
  
  let audioRef = $state<HTMLAudioElement | null>(null);
  let isPlaying = $state(false);

  $effect(() => {
    if (audioRef) {
      if (isActive) {
        audioRef.play().then(() => isPlaying = true).catch(() => isPlaying = false);
      } else {
        audioRef.pause();
        // Reset playback when not active
        audioRef.currentTime = 0;
        isPlaying = false;
      }
    }
  });
  
  function handlePointerDown(e: PointerEvent) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  
  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    offset.set({ x: e.clientX - startX, y: e.clientY - startY });
  }
  
  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    
    let x = $offset.x;
    if (x > 100) {
      if (audioRef) audioRef.pause();
      onSwipe('right', track);
    } else if (x < -100) {
      if (audioRef) audioRef.pause();
      onSwipe('left', track);
    } else {
      offset.set({ x: 0, y: 0 });
    }
  }

  function togglePlay() {
    if (!audioRef) return;
    if (isPlaying) {
      audioRef.pause();
    } else {
      audioRef.play();
    }
    isPlaying = !isPlaying;
  }

  function formatDuration(ms: number) {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
</script>

<div 
  class="absolute w-full touch-none cursor-grab active:cursor-grabbing origin-bottom flex flex-col items-center"
  style="transform: translate({$offset.x}px, {$offset.y}px) rotate({$offset.x * 0.05}deg)"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
>
  <div class="relative w-full aspect-square shrink-0 rounded-[2rem] overflow-hidden shadow-2xl bg-gray-900">
    <img src={track.albumArt} alt={track.title} class="w-full h-full object-cover pointer-events-none" />
    
    <!-- Swipe Indicators over the image -->
    <div class="absolute top-8 left-8 border-4 border-[#1DB954] text-[#1DB954] font-black text-4xl py-2 px-6 rounded-2xl transform -rotate-12 opacity-0 pointer-events-none transition-opacity" style="opacity: {$offset.x > 50 ? ($offset.x - 50) / 100 : 0}">SAVE</div>
    <div class="absolute top-8 right-8 border-4 border-red-500 text-red-500 font-black text-4xl py-2 px-6 rounded-2xl transform rotate-12 opacity-0 pointer-events-none transition-opacity" style="opacity: {$offset.x < -50 ? (-$offset.x - 50) / 100 : 0}">SKIP</div>

    {#if track.previewUrl}
      <button 
        class="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 text-white rounded-full p-4 pointer-events-auto transform transition-transform active:scale-95 shadow-lg shadow-black/50 shrink-0"
        onclick={(e) => { e.stopPropagation(); togglePlay(); }}
      >
        {#if isPlaying}
          <Pause size={28} fill="currentColor" />
        {:else}
          <Play size={28} fill="currentColor" />
        {/if}
      </button>
      <audio 
         bind:this={audioRef} 
         src={track.previewUrl} 
         onended={() => isPlaying = false}
      ></audio>
    {/if}
  </div>

  <!-- Content (Below the Artwork) -->
  <div class="w-full pt-6 flex flex-col items-center text-center pointer-events-none transition-opacity duration-300 {isActive ? 'opacity-100' : 'opacity-0'}">
    <h2 class="text-3xl font-black text-white leading-tight mb-1 w-full drop-shadow-md">{track.title}</h2>
    <p class="text-xl text-gray-300 font-medium w-full drop-shadow-md">{track.artist}</p>
    {#if track.duration_ms}
      <p class="text-sm text-gray-400 font-medium mt-1 drop-shadow-sm">{formatDuration(track.duration_ms)}</p>
    {/if}
  </div>
</div>
