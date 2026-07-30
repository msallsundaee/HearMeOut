<script lang="ts">
  import { ArrowLeft, User, Library, LogOut } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { savedTracks } from '$lib/stores/savedTracks';

  let isHome = $derived($page.url.pathname === '/');
  let isDiscover = $derived($page.url.pathname.startsWith('/discover/'));

  let title = $derived.by(() => {
    if (isDiscover) {
      const slug = $page.url.pathname.split('/').pop() || '';
      return slug.replace(/-/g, ' ');
    }
    return 'HearMeOut';
  });

  let showDropdown = $state(false);

  // Fixed hierarchy rather than browser history: discover -> categories -> home.
  // history.back() was unpredictable on categories — landing there via a fresh
  // tab/link/refresh (no prior HearMeOut entry) left it with nowhere useful to go.
  function handleBack() {
    goto(isDiscover ? '/categories' : '/');
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    showDropdown = false;
    window.location.href = '/';
  }
</script>

<nav class="pointer-events-none fixed top-0 left-0 z-50 w-full px-4 pt-safe pb-3">
  <div class="relative mx-auto flex h-12 max-w-5xl items-center justify-between gap-2">
    <!-- ── Back ─────────────────────────────────────────── -->
    <div class="pointer-events-auto flex flex-1 justify-start">
      {#if !isHome}
        <button
          onclick={handleBack}
          aria-label="Go back"
          class="glass-strong grid h-11 w-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15 active:scale-90"
          in:fade={{ duration: 150 }}
        >
          <ArrowLeft size={22} />
        </button>
      {/if}
    </div>

    <!-- ── Title ────────────────────────────────────────── -->
    {#if !isHome}
      <div class="pointer-events-auto flex max-w-[52%] flex-none justify-center">
        {#if isDiscover}
          <button
            onclick={() => goto('/categories')}
            class="glass-strong flex items-center rounded-full px-5 py-2.5 shadow-xl transition-colors hover:bg-white/10"
            in:fly={{ y: -8, duration: 220 }}
          >
            <!-- Same weight/tracking as the category cards' names, not the old
                 tiny tracked-out caps — the chip should read like the rest of
                 the site, not a separate label style. -->
            <span
              class="font-display truncate text-sm font-bold tracking-tight text-white capitalize"
            >
              {title}
            </span>
          </button>
        {:else}
          <a
            href="/"
            class="glass-strong flex items-center rounded-full px-5 py-2.5 shadow-xl transition-colors hover:bg-white/10"
          >
            <span class="text-gradient font-display text-base font-black tracking-tight">
              HearMeOut
            </span>
          </a>
        {/if}
      </div>
    {/if}

    <!-- ── Actions ──────────────────────────────────────── -->
    <div class="pointer-events-auto flex flex-1 items-center justify-end gap-2.5">
      <a
        href="/saved"
        aria-label="Saved tracks"
        class="glass-strong relative grid h-11 w-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15 active:scale-90"
      >
        <Library size={21} />
        {#if $savedTracks.length > 0}
          <span
            class="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-black text-white ring-2 ring-background"
            in:fade={{ duration: 150 }}
          >
            {$savedTracks.length > 99 ? '99+' : $savedTracks.length}
          </span>
        {/if}
      </a>

      <div class="relative">
        {#if $page.data.isLoggedIn}
          <button
            onclick={() => (showDropdown = !showDropdown)}
            aria-label="Account menu"
            aria-expanded={showDropdown}
            class="glass-strong grid h-11 w-11 place-items-center rounded-full transition-colors active:scale-90 {showDropdown
              ? 'bg-white/20 text-white'
              : 'text-white hover:bg-white/15'}"
          >
            <User size={21} />
          </button>

          {#if showDropdown}
            <button
              class="fixed inset-0 h-full w-full cursor-default focus:outline-none"
              onclick={() => (showDropdown = false)}
              aria-label="Close menu"
            ></button>

            <div
              class="glass-strong absolute right-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-2xl py-1.5 shadow-2xl"
              in:fly={{ y: -8, duration: 180 }}
              out:fade={{ duration: 120 }}
            >
              <a
                href="/profile"
                class="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                onclick={() => (showDropdown = false)}
              >
                <User size={17} />
                Account
              </a>
              <a
                href="/saved"
                class="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                onclick={() => (showDropdown = false)}
              >
                <Library size={17} />
                Your library
              </a>
              <div class="my-1 h-px bg-white/10"></div>
              <button
                onclick={handleLogout}
                class="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-skip transition-colors hover:bg-skip/10"
              >
                <LogOut size={17} />
                Log out
              </button>
            </div>
          {/if}
        {:else}
          <a
            href="/login"
            aria-label="Sign in"
            class="glass-strong grid h-11 w-11 place-items-center rounded-full text-white transition-colors hover:bg-white/15 active:scale-90"
          >
            <User size={21} />
          </a>
        {/if}
      </div>
    </div>
  </div>
</nav>
