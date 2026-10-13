<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import NavigationLoadingBar from '$lib/components/NavigationLoadingBar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<link rel="apple-touch-icon" href="/favicon.svg" />
</svelte:head>

<NavigationLoadingBar />
<Navbar />
{@render children()}
