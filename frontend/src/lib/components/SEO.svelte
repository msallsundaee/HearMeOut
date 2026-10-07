<script lang="ts">
	import { siteConfig, getCanonicalUrl, getAbsoluteImageUrl } from '$lib/config/site';

	export interface BreadcrumbItem {
		name: string;
		url: string;
	}

	interface Props {
		title?: string;
		description?: string;
		pathname?: string;
		ogType?: 'website' | 'music.playlist' | 'music.song' | 'music.radio_station' | 'article';
		image?: string;
		imageAlt?: string;
		noindex?: boolean;
		keywords?: string[];
		schema?: Record<string, any> | Record<string, any>[];
		breadcrumbs?: BreadcrumbItem[];
		audioPreviewUrl?: string;
	}

	let {
		title,
		description = siteConfig.description,
		pathname = '',
		ogType = 'website',
		image,
		imageAlt = `${siteConfig.name} banner`,
		noindex = false,
		keywords = siteConfig.keywords,
		schema,
		breadcrumbs,
		audioPreviewUrl
	}: Props = $props();

	let formattedTitle = $derived(
		title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`
	);
	let canonicalUrl = $derived(getCanonicalUrl(pathname));
	let ogImageUrl = $derived(getAbsoluteImageUrl(image));
	let robotsContent = $derived(
		noindex
			? 'noindex, nofollow'
			: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
	);

	let mergedSchemas = $derived(() => {
		const list: Record<string, any>[] = [];

		if (breadcrumbs && breadcrumbs.length > 0) {
			list.push({
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: breadcrumbs.map((bc, index) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: bc.name,
					item: getCanonicalUrl(bc.url)
				}))
			});
		}

		if (schema) {
			if (Array.isArray(schema)) {
				list.push(...schema);
			} else {
				list.push(schema);
			}
		}

		return list;
	});
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{formattedTitle}</title>
	<meta name="title" content={formattedTitle} />
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords.join(', ')} />
	<meta name="author" content={siteConfig.creator} />
	<meta name="robots" content={robotsContent} />
	<meta name="googlebot" content={robotsContent} />
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph / Facebook / LinkedIn / Discord -->
	<meta property="og:type" content={ogType} />
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:title" content={title ? `${title} | ${siteConfig.name}` : formattedTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:alt" content={imageAlt} />
	<meta property="og:locale" content="en_US" />
	{#if audioPreviewUrl}
		<meta property="og:audio" content={audioPreviewUrl} />
		<meta property="og:audio:type" content="audio/mpeg" />
	{/if}

	<!-- Twitter / X Cards -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={siteConfig.twitterHandle} />
	<meta name="twitter:creator" content={siteConfig.twitterHandle} />
	<meta name="twitter:title" content={title ? `${title} | ${siteConfig.name}` : formattedTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:image:alt" content={imageAlt} />

	<!-- JSON-LD Structured Data for Google Rich Snippets -->
	{#each mergedSchemas() as s}
		{@html `<script type="application/ld+json">${JSON.stringify(s)}</script>`}
	{/each}
</svelte:head>
