<script lang="ts">
  /** Animated soundwave bars. Freezes at a low resting height when `playing` is false. */
  let { bars = 4, playing = true, class: klass = 'h-4 w-5', color = 'currentColor' } = $props();

  // Staggered so the bars never move in lockstep
  const delays = [0, 220, 90, 340, 160, 400, 60];
  const speeds = [900, 720, 1040, 820, 960, 700, 880];
</script>

<!-- The caller's class sets the size — no h-full/w-full here, or it would fight it -->
<div class="flex items-center justify-center gap-0.75 {klass}" aria-hidden="true">
  {#each Array(bars) as _, i}
    <span
      class="h-full min-w-0.5 flex-1 rounded-full {playing ? 'animate-eq' : ''}"
      style="background: {color}; animation-delay: {delays[i % delays.length]}ms;
             animation-duration: {speeds[i % speeds.length]}ms;
             {playing ? '' : 'transform: scaleY(0.22);'}"
    ></span>
  {/each}
</div>
