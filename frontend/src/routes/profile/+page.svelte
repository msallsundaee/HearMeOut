<script lang="ts">
  import { fade } from 'svelte/transition';
  import { User, Mail, Music, ChevronRight, Library, CheckCircle } from 'lucide-svelte';

  let { data } = $props();
</script>

<div class="min-h-screen bg-black text-white pt-24 pb-32 px-4" in:fade>
  <div class="max-w-2xl mx-auto space-y-8">
    
    <div>
      <h1 class="text-4xl md:text-5xl font-black mb-2">Account Settings</h1>
      <p class="text-gray-400">Manage your HearMeOut profile and integrations.</p>
    </div>

    <!-- User Profile Card -->
    <div class="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
      
      <div class="flex items-center space-x-6 relative z-10">
        <div class="flex-shrink-0 w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700">
          <User size={40} class="text-gray-400" />
        </div>
        
        <div class="flex-1">
          <h2 class="text-3xl font-bold text-white mb-1">{data.user?.name || 'HearMeOut User'}</h2>
          <div class="flex items-center text-gray-400">
            <Mail size={16} class="mr-2" />
            {data.user?.email || 'No email associated'}
          </div>
        </div>
      </div>

      <div class="mt-8 flex gap-4">
        <a href="/saved" class="flex-1 bg-white text-black font-bold py-3 px-6 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
          <Library size={18} class="mr-2" />
          View Saved Tracks
        </a>
      </div>
    </div>

    <!-- Spotify Integration Card -->
    <div class="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <h3 class="text-xl font-bold mb-6 flex items-center">
        <Music class="mr-2 text-[#1DB954]" size={24} />
        Spotify Connection
      </h3>
      
      {#if data.hasSpotifyToken}
        <div class="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center text-black">
              <CheckCircle size={20} />
            </div>
            <div>
              <p class="font-bold text-white">Connected to Spotify</p>
              <p class="text-sm text-green-400">Ready to export tracks</p>
            </div>
          </div>
          <!-- Option to disconnect could go here if implemented -->
        </div>
      {:else}
        <div class="flex flex-col sm:flex-row items-center justify-between p-4 bg-black/50 border border-gray-800 rounded-2xl gap-4">
          <div>
            <p class="font-bold text-white">Not Connected</p>
            <p class="text-sm text-gray-400">Connect to enable track exporting</p>
          </div>
          <a 
            href="/api/auth/login" 
            class="whitespace-nowrap flex items-center py-2 px-6 rounded-full bg-[#1DB954] text-black font-bold hover:scale-105 transition-transform"
          >
            Connect Account
            <ChevronRight size={16} class="ml-2" />
          </a>
        </div>
      {/if}
    </div>

  </div>
</div>
