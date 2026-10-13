<script lang="ts">
  import { fade, slide } from 'svelte/transition';
  import { savedTracks } from '$lib/stores/savedTracks';
  import { Music, Check, ArrowRight, Trash2, Library, Play, Pause, Loader2, Disc3, Compass } from 'lucide-svelte';
  import SEO from '$lib/components/SEO.svelte';
  import Aurora from '$lib/components/Aurora.svelte';

  let { data } = $props();

  const quickGenres = [
    { name: 'Explore', slug: 'explore' },
    { name: 'Pop', slug: 'pop' },
    { name: 'Rock', slug: 'rock' },
    { name: 'OPM Hits', slug: 'opm' },
    { name: 'Hip-Hop', slug: 'hip-hop' }
  ];
  
  // Track selection state
  let selectedTracks = $state<Set<string>>(new Set());
  let isExporting = $state(false);
  let exportSuccess = $state(false);
  let customPlaylistName = $state('HearMeOut Discover');
  let initializedSelection = false;

  // Audio preview state
  let audioEl = $state<HTMLAudioElement | null>(null);
  let playingSpotifyId = $state<string | null>(null);
  let loadingAudioId = $state<string | null>(null);
  const previewCache = new Map<string, string>();

  // Initialize all tracks as selected only once when the store loads
  $effect(() => {
    if (!initializedSelection && $savedTracks.length > 0 && !exportSuccess) {
      initializedSelection = true;
      selectedTracks = new Set($savedTracks.map((t) => t.spotifyId));
    }
  });

  function selectAll() {
    selectedTracks = new Set($savedTracks.map((t) => t.spotifyId));
  }

  function deselectAll() {
    selectedTracks = new Set();
  }

  function toggleSelection(spotifyId: string) {
    if (selectedTracks.has(spotifyId)) {
      selectedTracks.delete(spotifyId);
    } else {
      selectedTracks.add(spotifyId);
    }
    selectedTracks = new Set(selectedTracks);
  }

  function removeTrack(spotifyId: string) {
    if (playingSpotifyId === spotifyId) {
      audioEl?.pause();
      playingSpotifyId = null;
    }
    savedTracks.removeTrack(spotifyId);
    if (selectedTracks.has(spotifyId)) {
      selectedTracks.delete(spotifyId);
      selectedTracks = new Set(selectedTracks);
    }
  }

  async function togglePlay(track: any) {
    if (playingSpotifyId === track.spotifyId) {
      audioEl?.pause();
      playingSpotifyId = null;
      return;
    }

    let url = track.previewUrl || previewCache.get(track.spotifyId) || '';

    if (!url) {
      loadingAudioId = track.spotifyId;
      try {
        const res = await fetch(
          `/api/preview?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`
        );
        if (res.ok) {
          const data = await res.json();
          url = data.previewUrl || '';
          if (url) previewCache.set(track.spotifyId, url);
        }
      } catch (e) {
        console.error('Failed to load preview:', e);
      } finally {
        loadingAudioId = null;
      }
    }

    if (!url) {
      alert('No audio preview available for this track.');
      return;
    }

    if (audioEl) {
      audioEl.src = url;
      audioEl
        .play()
        .then(() => {
          playingSpotifyId = track.spotifyId;
        })
        .catch(() => {
          playingSpotifyId = null;
        });
    }
  }

  function getCachedPlaylistId(name: string) {
    try {
      const cache = JSON.parse(localStorage.getItem('hearmeout_playlists') || '{}');
      return cache[name] || null;
    } catch (e) {
      return null;
    }
  }

  function saveCachedPlaylistId(name: string, id: string) {
    try {
      const cache = JSON.parse(localStorage.getItem('hearmeout_playlists') || '{}');
      cache[name] = id;
      localStorage.setItem('hearmeout_playlists', JSON.stringify(cache));
    } catch (e) {}
  }

  async function exportToSpotify() {
    if (!data.hasSpotifyToken) {
      window.location.href = '/api/auth/login?redirect=/saved';
      return;
    }

    if (selectedTracks.size === 0) return;

    isExporting = true;
    const finalName = customPlaylistName.trim() || 'HearMeOut Discover';
    
    try {
      const res = await fetch('/api/export-spotify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            trackIds: Array.from(selectedTracks),
            playlistName: finalName,
            cachedPlaylistId: getCachedPlaylistId(finalName)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.playlistId) {
            saveCachedPlaylistId(finalName, data.playlistId);
        }
        
        exportSuccess = true;
        // Remove them from local storage after successful export
        Array.from(selectedTracks).forEach(id => {
            savedTracks.removeTrack(id);
        });
        selectedTracks.clear();
        selectedTracks = new Set(selectedTracks); // trigger reactivity
      } else if (res.status === 401) {
        window.location.href = '/api/auth/login?redirect=/saved';
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Export failed: ${res.status} - ${errorData.error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error('Failed to export', e);
      alert("Something went wrong communicating with the server.");
    } finally {
      isExporting = false;
    }
  }
</script>

<SEO
  title="My Saved Tracks"
  description="Review your saved tracks and export them directly to your Spotify playlists."
  pathname="/saved"
  noindex={true}
/>

<div class="relative min-h-dvh overflow-hidden bg-background text-white pt-24 pb-32 px-4" in:fade>
  <Aurora intensity={0.4} />

  <div class="relative z-10 max-w-4xl mx-auto">
    <div class="flex items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2">My Saved Tracks</h1>
        <p class="text-sm sm:text-base text-gray-400">Review your swipes and export them to your library.</p>
      </div>
      <div class="shrink-0 bg-primary/20 p-3 sm:p-4 rounded-full text-primary">
        <Library size={26} class="sm:hidden" />
        <Library size={32} class="hidden sm:block" />
      </div>
    </div>

    {#if exportSuccess}
      <div class="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 mb-8 flex items-start space-x-4" in:slide>
        <div class="bg-green-500 rounded-full p-2 text-black shrink-0">
          <Check size={24} />
        </div>
        <div>
          <h3 class="text-xl font-bold text-green-400 mb-1">Successfully Exported!</h3>
          <p class="text-green-400/80">Your selected tracks have been added to your '{customPlaylistName || 'HearMeOut Discover'}' Spotify playlist.</p>
        </div>
      </div>
    {/if}

    {#if $savedTracks.length === 0}
      <div class="relative z-10 mx-auto mt-6 flex w-full max-w-xl flex-col items-center px-2 text-center">
        <!-- Vinyl / Disc graphic with subtle neon aura -->
        <div class="relative mb-6 flex items-center justify-center">
          <div
            class="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse"
            aria-hidden="true"
          ></div>
          <div
            class="glass-strong relative flex h-20 w-20 items-center justify-center rounded-full border border-white/15 shadow-[0_0_35px_rgba(29,185,84,0.3)] sm:h-26 sm:w-26 md:h-28 md:w-28"
          >
            <Disc3
              size={48}
              class="text-primary animate-[spin_10s_linear_infinite]"
              strokeWidth={1.75}
            />
            <div class="absolute h-3.5 w-3.5 rounded-full bg-background border-2 border-white/30"></div>
          </div>
        </div>

        <!-- Pill badge -->
        <div
          class="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-mono font-bold tracking-widest text-primary uppercase backdrop-blur-md"
        >
          <span>Empty Crate</span>
        </div>

        <h2 class="font-display text-2xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          No tracks saved yet
        </h2>
        <p class="mt-3.5 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
          Start swiping on tracks in Explore or your favorite crates to build up your personal Spotify collection here.
        </p>

        <!-- Action buttons -->
        <div class="mt-8 flex w-full flex-col items-center justify-center gap-3.5 sm:flex-row">
          <a
            href="/discover/explore"
            class="brand-gradient flex h-12 w-full items-center justify-center gap-2 rounded-full px-7 font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03] active:scale-95 sm:w-auto"
          >
            <Compass size={18} />
            <span>Start Exploring</span>
          </a>

          <a
            href="/categories"
            class="glass flex h-12 w-full items-center justify-center gap-2 rounded-full px-7 font-bold text-white transition-all hover:bg-white/15 active:scale-95 sm:w-auto"
          >
            <Disc3 size={18} />
            <span>Browse Crates</span>
          </a>
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
    {:else}
      <!-- Toolbar: Select/Deselect All -->
      <div class="flex items-center justify-between mb-4 px-1">
        <span class="text-sm text-gray-400">
          Showing {$savedTracks.length} saved {$savedTracks.length === 1 ? 'track' : 'tracks'}
        </span>
        <div class="flex gap-2">
          <button
            onclick={selectAll}
            class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            Select All
          </button>
          <button
            onclick={deselectAll}
            class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>

      <div class="space-y-4 mb-8">
        {#each $savedTracks as track (track.id)}
          <div class="group flex items-center space-x-4 bg-gray-900/50 hover:bg-gray-900 border border-gray-800 p-4 rounded-2xl transition-colors">
            <!-- Checkbox -->
            <button 
              class="w-6 h-6 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors cursor-pointer {selectedTracks.has(track.spotifyId) ? 'bg-primary border-primary text-black' : 'border-gray-600 hover:border-gray-400'}"
              onclick={() => toggleSelection(track.spotifyId)}
              aria-label="Select track"
            >
              {#if selectedTracks.has(track.spotifyId)}
                <Check size={16} strokeWidth={4} />
              {/if}
            </button>

            <!-- Album Art + Play Button Overlay -->
            <div class="relative w-16 h-16 rounded-md overflow-hidden shrink-0 group/cover">
              <img src={track.albumArt} alt={track.title} class="w-full h-full object-cover shadow-md" />
              <button
                onclick={() => togglePlay(track)}
                aria-label={playingSpotifyId === track.spotifyId ? 'Pause preview' : 'Play preview'}
                class="absolute inset-0 bg-black/45 flex items-center justify-center transition-opacity cursor-pointer {playingSpotifyId === track.spotifyId ? 'opacity-100 bg-primary/25' : 'opacity-0 group-hover/cover:opacity-100'}"
              >
                {#if loadingAudioId === track.spotifyId}
                  <Loader2 size={22} class="text-white animate-spin" />
                {:else if playingSpotifyId === track.spotifyId}
                  <Pause size={22} class="text-primary fill-primary" />
                {:else}
                  <Play size={22} class="text-white fill-white translate-x-0.5" />
                {/if}
              </button>
            </div>

            <!-- Track Info -->
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-lg truncate text-white">{track.title}</h3>
              <p class="text-gray-400 truncate">{track.artist}</p>
            </div>

            <!-- Remove Button -->
            <button
              class="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors shrink-0 cursor-pointer"
              onclick={() => removeTrack(track.spotifyId)}
              aria-label="Remove track"
            >
              <Trash2 size={20} />
            </button>
          </div>
        {/each}
      </div>

      <audio bind:this={audioEl} onended={() => (playingSpotifyId = null)} class="hidden"></audio>
    {/if}
  </div>
</div>

{#if $savedTracks.length > 0}
  <div class="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-gray-800 p-4 md:p-6 z-50 transform transition-transform" in:slide>
    <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-center sm:text-left flex-1 w-full">
        <p class="text-white font-bold text-lg mb-1">{selectedTracks.size} tracks selected</p>
        <div class="flex items-center justify-center sm:justify-start space-x-2">
          <label for="playlistName" class="text-gray-400 text-sm whitespace-nowrap hidden sm:block">Playlist:</label>
          <input 
            type="text" 
            id="playlistName"
            bind:value={customPlaylistName} 
            placeholder="Playlist Name"
            class="bg-gray-900/80 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white w-full sm:max-w-[200px] focus:border-primary focus:outline-none transition-colors"
          />
        </div>
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
