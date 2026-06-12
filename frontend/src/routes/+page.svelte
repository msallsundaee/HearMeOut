<script lang="ts">
  import { Music, Flame } from 'lucide-svelte';
  import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
  
  <!-- Background gradient decorations -->
  <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#1DB954]/20 rounded-full blur-3xl pointer-events-none"></div>

  <div class="max-w-md w-full text-center space-y-8 z-10">
    <div class="flex justify-center mb-8">
      <div class="bg-primary p-4 rounded-full shadow-2xl shadow-primary/50 animate-bounce">
        <Flame size={64} class="text-white" />
      </div>
    </div>
    
    <h1 class="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">HearMeOut</h1>
    <p class="text-xl text-gray-400 mb-12">Discover new music with a swipe.</p>
    
    {#if $page.url.searchParams.get('error')}
      <div class="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
        <p>Authentication failed. Please try again.</p>
      </div>
    {/if}

    <div class="space-y-4 pt-8">
      <a 
        href="/categories"
        class="flex items-center justify-center w-full py-4 px-6 rounded-full bg-white text-black hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95 font-bold text-lg shadow-lg"
      >
        <Flame class="mr-2" size={24} />
        Start Exploring
      </a>
      <a 
        href="/api/auth/login"
        class="flex items-center justify-center w-full py-4 px-6 rounded-full bg-[#1DB954]/10 hover:bg-[#1DB954]/20 border border-[#1DB954] transition-all transform hover:scale-105 active:scale-95 text-[#1DB954] font-bold text-lg shadow-lg"
      >
        <Music class="mr-2" size={24} />
        Connect Spotify
      </a>
      
      <p class="text-xs text-gray-500 mt-4">
        We use Spotify to customize your experience and save your liked tracks.
      </p>
    </div>
  </div>
</div>
