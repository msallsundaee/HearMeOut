<script lang="ts">
  /**
   * Ambient background: the original two green corner blobs, but drifting
   * slowly instead of sitting still. Purely decorative.
   */
  let { intensity = 1, class: klass = '' } = $props();
</script>

<div class="pointer-events-none absolute inset-0 overflow-hidden {klass}" aria-hidden="true">
  <div
    class="animate-drift absolute -top-[15%] -left-[15%] h-[55vh] w-[55vh] rounded-full bg-primary blur-[100px] will-change-transform"
    style="opacity: {0.22 * intensity}"
  ></div>
  <div
    class="animate-drift-slow absolute -right-[15%] -bottom-[15%] h-[55vh] w-[55vh] rounded-full bg-spotify blur-[100px] will-change-transform"
    style="opacity: {0.2 * intensity}"
  ></div>

  <!-- Vignette keeps the type legible over the colour -->
  <div
    class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)]"
  ></div>
  <div class="grain"></div>
</div>
