<script lang="ts">
  /** Animated soundwave bars. Natural organic waveform when paused, fluid equalizer animations when playing. */
  let {
    bars = 8,
    playing = true,
    class: klass = 'h-6 w-14',
    color = '#ffffff',
    glow = true
  } = $props();

  // Natural organic heights for resting waveform (like a balanced studio soundwave)
  const restingHeights = [0.3, 0.55, 0.85, 1, 0.9, 0.7, 0.45, 0.28, 0.6];
  const delays = [0, 180, 80, 260, 120, 320, 200, 100, 240];
  const speeds = [750, 920, 680, 840, 780, 890, 720, 860, 790];
</script>

<div class="flex items-center justify-center gap-1 sm:gap-1.25 {klass}" aria-hidden="true">
  {#each Array(bars) as _, i}
    <span
      class="h-full min-w-0.25 flex-1 rounded-full transition-transform duration-300 {playing ? 'animate-eq' : ''}"
      style="background: {color};
             animation-delay: {delays[i % delays.length]}ms;
             animation-duration: {speeds[i % speeds.length]}ms;
             transform: scaleY({playing ? 1 : restingHeights[i % restingHeights.length]});
             {glow && playing ? `box-shadow: 0 0 12px ${color}10, 0 0 4px ${color};` : ''}"
    ></span>
  {/each}
</div>
