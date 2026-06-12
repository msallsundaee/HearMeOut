<script lang="ts">
  import { fade } from 'svelte/transition';
  import { User, Lock, Loader2 } from 'lucide-svelte';
  
  let email = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let errorMsg = $state('');

  async function handleLogin(e: Event) {
    e.preventDefault();
    isLoading = true;
    errorMsg = '';
    
    try {
      const res = await fetch('/api/auth/app-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        window.location.href = '/saved';
      } else {
        errorMsg = data.error || 'Login failed';
      }
    } catch (e) {
      errorMsg = 'An unexpected error occurred.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden" in:fade>
  <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

  <div class="w-full max-w-md space-y-8 z-10 bg-gray-900/50 backdrop-blur-md p-8 rounded-3xl border border-gray-800 shadow-2xl">
    <div class="text-center">
      <h2 class="text-3xl font-black text-white">Welcome Back</h2>
      <p class="text-gray-400 mt-2">Sign in to save your discovered tracks permanently.</p>
    </div>

    {#if errorMsg}
      <div class="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-xl text-sm font-medium text-center">
        {errorMsg}
      </div>
    {/if}

    <form class="space-y-6" onsubmit={handleLogin}>
      <div>
        <label for="email" class="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <User size={18} />
          </div>
          <input type="email" id="email" bind:value={email} required class="bg-black/50 border border-gray-700 text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-full pl-10 p-3 outline-none transition-colors" placeholder="you@example.com">
        </div>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-400 mb-2">Password</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Lock size={18} />
          </div>
          <input type="password" id="password" bind:value={password} required class="bg-black/50 border border-gray-700 text-white text-sm rounded-xl focus:ring-primary focus:border-primary block w-full pl-10 p-3 outline-none transition-colors" placeholder="••••••••">
        </div>
      </div>

      <button type="submit" disabled={isLoading} class="w-full text-black bg-primary hover:bg-primary/90 focus:ring-4 focus:outline-none focus:ring-primary/50 font-bold rounded-full text-lg px-5 py-4 text-center transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex justify-center items-center">
        {#if isLoading}
          <Loader2 class="animate-spin mr-2" size={20} />
          Signing in...
        {:else}
          Sign In
        {/if}
      </button>
      
      <p class="text-sm font-medium text-gray-400 text-center mt-4">
        Don't have an account? <a href="/register" class="text-primary hover:underline">Sign up</a>
      </p>
    </form>
  </div>
</div>
