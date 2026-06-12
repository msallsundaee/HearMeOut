<script lang="ts">
  import { spring } from 'svelte/motion';
  import { Play, Pause } from 'lucide-svelte';
  
  let { track, onSwipe } = $props();
  
  let offset = spring({ x: 0, y: 0 }, { stiffness: 0.1, damping: 0.4 });
  let isDragging = $state(false);
  let startX = 0;
  let startY = 0;
  
  let audioRef = $state<HTMLAudioElement | null>(null);
  let isPlaying = $state(false);
  
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
</script>

<div 
  class="absolute w-full h-[70vh] bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl touch-none cursor-grab active:cursor-grabbing origin-bottom"
  style="transform: translate({$offset.x}px, {$offset.y}px) rotate({$offset.x * 0.05}deg)"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
>
  <img src={track.albumArt} alt={track.title} class="w-full h-full object-cover pointer-events-none" />
  
  <!-- Overlay -->
  <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>

  <!-- Content -->
  <div class="absolute bottom-0 w-full p-8 pb-10 pointer-events-none">
    <div class="flex justify-between items-end">
      <div class="flex-1 pr-4">
        <h2 class="text-4xl font-black text-white leading-tight drop-shadow-lg mb-1">{track.title}</h2>
        <p class="text-2xl text-gray-300 font-medium drop-shadow-md">{track.artist}</p>
      </div>
      
      {#if track.previewUrl}
        <button 
          class="bg-primary hover:bg-primary/90 text-white rounded-full p-4 pointer-events-auto transform transition-transform active:scale-95 shadow-xl shadow-primary/30 shrink-0"
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
           autoplay
        />
      {/if}
    </div>
  </div>
  
  <!-- Swipe Indicators -->
  <div class="absolute top-12 left-8 border-4 border-[#1DB954] text-[#1DB954] font-black text-5xl py-2 px-6 rounded-2xl transform -rotate-12 opacity-0 pointer-events-none transition-opacity" style="opacity: {$offset.x > 50 ? ($offset.x - 50) / 100 : 0}">SAVE</div>
  <div class="absolute top-12 right-8 border-4 border-red-500 text-red-500 font-black text-5xl py-2 px-6 rounded-2xl transform rotate-12 opacity-0 pointer-events-none transition-opacity" style="opacity: {$offset.x < -50 ? (-$offset.x - 50) / 100 : 0}">SKIP</div>
</div>
