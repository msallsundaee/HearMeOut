<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { savedTracks } from '$lib/stores/savedTracks';
  import { Music, Check, ArrowRight, Trash2, Library } from 'lucide-svelte';

  let { data } = $props();
  
  // Track selection state
  let selectedTracks = $state<Set<string>>(new Set());
  let isExporting = $state(false);
  let exportSuccess = $state(false);

  // Initialize all tracks as selected when the store loads
  $effect(() => {
    if (selectedTracks.size === 0 && $savedTracks.length > 0 && !exportSuccess) {
      selectedTracks = new Set($savedTracks.map(t => t.spotifyId));
    }
  });

  function toggleSelection(spotifyId: string) {
    if (selectedTracks.has(spotifyId)) {
      selectedTracks.delete(spotifyId);
    } else {
      selectedTracks.add(spotifyId);
    }
    selectedTracks = new Set(selectedTracks); // trigger reactivity
  }

  function removeTrack(spotifyId: string) {
    savedTracks.removeTrack(spotifyId);
    if (selectedTracks.has(spotifyId)) {
      selectedTracks.delete(spotifyId);
      selectedTracks = new Set(selectedTracks);
    }
  }

  async function exportToSpotify() {
    if (!data.hasSpotifyToken) {
      window.location.href = '/api/auth/login?redirect=/saved';
      return;
    }

    if (selectedTracks.size === 0) return;

    isExporting = true;
    try {
      const res = await fetch('/api/export-spotify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackIds: Array.from(selectedTracks) })
      });

      if (res.ok) {
        exportSuccess = true;
        // Optionally, remove them from local storage after successful export
        // Array.from(selectedTracks).forEach(id => savedTracks.removeTrack(id));
      } else if (res.status === 401) {
        window.location.href = '/api/auth/login?redirect=/saved';
      }
    } catch (e) {
      console.error('Failed to export', e);
    } finally {
      isExporting = false;
    }
  }
</script>

<div class="min-h-screen bg-black text-white pt-24 pb-32 px-4" in:fade>
  <div class="max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl md:text-5xl font-black mb-2">My Saved Tracks</h1>
        <p class="text-gray-400">Review your swipes and export them to your library.</p>
      </div>
      <div class="bg-primary/20 p-4 rounded-full text-primary">
        <Library size={32} />
      </div>
    </div>

    {#if $savedTracks.length === 0}
      <div class="bg-gray-900 border border-gray-800 rounded-3xl p-12 text-center mt-12">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 mb-6">
          <Music size={32} class="text-gray-500" />
        </div>
        <h2 class="text-2xl font-bold mb-4">No tracks saved yet</h2>
        <p class="text-gray-400 mb-8 max-w-md mx-auto">Start swiping on tracks in the Discover page to build up your collection here.</p>
        <a href="/categories" class="inline-block bg-primary text-white font-bold py-4 px-8 rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/30">Start Exploring</a>
      </div>
    {:else}
      {#if exportSuccess}
        <div class="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 mb-8 flex items-start space-x-4" in:slide>
          <div class="bg-green-500 rounded-full p-2 text-black shrink-0">
            <Check size={24} />
          </div>
          <div>
            <h3 class="text-xl font-bold text-green-400 mb-1">Successfully Exported!</h3>
            <p class="text-green-400/80">Your selected tracks have been added to your Spotify 'Liked Songs' library.</p>
          </div>
        </div>
      {/if}

      <div class="space-y-4 mb-8">
        {#each $savedTracks as track (track.id)}
          <div class="flex items-center space-x-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 p-4 rounded-2xl transition-colors">
            <!-- Checkbox -->
            <button 
              class="w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors {selectedTracks.has(track.spotifyId) ? 'bg-primary border-primary text-black' : 'border-gray-600 hover:border-gray-400'}"
              onclick={() => toggleSelection(track.spotifyId)}
            >
              {#if selectedTracks.has(track.spotifyId)}
                <Check size={16} strokeWidth={4} />
              {/if}
            </button>

            <!-- Album Art -->
            <img src={track.albumArt} alt={track.title} class="w-16 h-16 rounded-xl object-cover shadow-md shrink-0" />

            <!-- Track Info -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-lg truncate text-white">{track.title}</h3>
              <p class="text-gray-400 truncate">{track.artist}</p>
            </div>

            <!-- Remove Button -->
            <button class="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0" onclick={() => removeTrack(track.spotifyId)}>
              <Trash2 size={20} />
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

{#if $savedTracks.length > 0}
  <div class="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-gray-800 p-4 md:p-6 z-50 transform transition-transform" in:slide>
    <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-center sm:text-left">
        <p class="text-white font-bold text-lg">{selectedTracks.size} tracks selected</p>
        <p class="text-gray-400 text-sm">Ready to add to your Spotify library</p>
      </div>

      <button 
        class="w-full sm:w-auto flex items-center justify-center py-4 px-8 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg {data.hasSpotifyToken ? 'bg-primary text-white shadow-primary/30' : 'bg-white text-black hover:bg-gray-200'} disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        onclick={exportToSpotify}
        disabled={isExporting || selectedTracks.size === 0}
      >
        {#if isExporting}
          <div class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
          Exporting...
        {:else if data.hasSpotifyToken}
          <Music size={20} class="mr-2" />
          Export to Spotify
        {:else}
          Connect Spotify to Export
          <ArrowRight size={20} class="ml-2" />
        {/if}
      </button>
    </div>
  </div>
{/if}
