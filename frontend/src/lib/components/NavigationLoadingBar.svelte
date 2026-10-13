<script lang="ts">
  import { navigating } from '$app/stores';

  let progress = $state(0);
  let visible = $state(false);
  let timer: ReturnType<typeof setInterval>;

  $effect(() => {
    if ($navigating) {
      visible = true;
      progress = 20;
      clearInterval(timer);
      timer = setInterval(() => {
        if (progress < 85) {
          progress += Math.floor(Math.random() * 12) + 4;
        }
      }, 200);
    } else if (visible) {
      clearInterval(timer);
      progress = 100;
      const timeout = setTimeout(() => {
        visible = false;
        progress = 0;
      }, 350);
      return () => clearTimeout(timeout);
    }
  });
</script>

{#if visible}
  <div
    class="pointer-events-none fixed top-0 inset-x-0 z-[100] h-[3px] overflow-hidden bg-white/5"
    aria-hidden="true"
  >
    <div
      class="h-full bg-linear-to-r from-primary via-emerald-300 to-primary shadow-[0_0_12px_var(--color-primary)] transition-all duration-200 ease-out"
      style="width: {progress}%; opacity: {progress === 100 ? 0 : 1};"
    ></div>
  </div>
{/if}
