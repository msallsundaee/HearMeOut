<script lang="ts">
  import { ArrowLeft, User, Flame, Library, LogOut } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  let showBackButton = $derived($page.url.pathname !== '/');
  
  let title = $derived.by(() => {
    if ($page.url.pathname.startsWith('/discover/')) {
        const slug = $page.url.pathname.split('/').pop() || '';
        return slug.replace(/-/g, ' ').toUpperCase();
    }
    return 'HearMeOut';
  });

  let showDropdown = $state(false);

  function handleBack() {
    if ($page.url.pathname.startsWith('/discover/')) {
      goto('/categories');
    } else {
      history.back();
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    showDropdown = false;
    window.location.href = '/';
  }
</script>

<nav class="fixed top-0 left-0 w-full z-50 p-4 pointer-events-none">
  <div class="relative max-w-5xl mx-auto flex items-center justify-between px-2 md:px-0 h-14">
    
    <!-- LEFT ALIGNED -->
    <div class="flex-1 flex justify-start pointer-events-auto">
      {#if showBackButton}
        <button 
          onclick={handleBack} 
          class="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors shadow-lg border border-white/10"
        >
          <ArrowLeft size={24} />
        </button>
      {:else}
        <div class="w-10 h-10"></div> <!-- Placeholder to maintain space if needed, though flex-1 handles it -->
      {/if}
    </div>
    
    <!-- CENTER ALIGNED -->
    <div class="flex-none pointer-events-auto flex justify-center z-10 max-w-[50%] md:max-w-none">
      <a href="/" class="px-3 md:px-6 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 shadow-xl flex items-center space-x-2 hover:bg-white/5 transition-colors whitespace-nowrap overflow-hidden">
        {#if title === 'HearMeOut'}
          <Flame size={20} class="text-primary animate-pulse shrink-0" />
        {/if}
        <span class="font-black tracking-wide truncate {title !== 'HearMeOut' ? 'text-white tracking-[0.2em] text-xs md:text-sm uppercase' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400'}">{title}</span>
      </a>
    </div>

    <!-- RIGHT ALIGNED -->
    <div class="flex-1 flex justify-end pointer-events-auto items-center space-x-3">
      <a 
        href="/saved"
        class="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-white hover:text-black transition-colors shadow-lg flex items-center justify-center relative"
        title="Saved Tracks"
      >
        <Library size={24} />
      </a>
      
      <div class="relative pointer-events-auto">
        {#if $page.data.isLoggedIn}
          <button 
            onclick={() => showDropdown = !showDropdown}
            class="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-primary hover:text-black hover:border-primary transition-colors shadow-lg flex items-center justify-center relative {showDropdown ? 'bg-primary text-black' : ''}"
            title="Profile"
          >
            <User size={24} />
          </button>
          
          {#if showDropdown}
            <!-- Backdrop to close dropdown -->
            <button 
              class="fixed inset-0 w-full h-full cursor-default focus:outline-none" 
              onclick={() => showDropdown = false}
              aria-label="Close menu"
            ></button>
            
            <!-- Dropdown Menu -->
            <div 
              class="absolute right-0 top-full mt-3 w-48 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
              in:fade={{duration: 150}} 
              out:fade={{duration: 150}}
            >
              <div class="px-4 py-3 border-b border-gray-800">
                <p class="text-sm text-gray-400 font-medium">Logged in</p>
              </div>
              <a 
                href="/profile"
                class="w-full text-left px-4 py-3 flex items-center text-white hover:bg-white/10 transition-colors font-medium border-b border-gray-800"
                onclick={() => showDropdown = false}
              >
                <User size={18} class="mr-2" />
                View Profile
              </a>
              <button 
                onclick={handleLogout}
                class="w-full text-left px-4 py-3 flex items-center text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium"
              >
                <LogOut size={18} class="mr-2" />
                Log Out
              </button>
            </div>
          {/if}
        {:else}
          <a 
            href="/login"
            class="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-primary hover:text-black hover:border-primary transition-colors shadow-lg flex items-center justify-center relative"
            title="Login"
          >
            <User size={24} />
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>
