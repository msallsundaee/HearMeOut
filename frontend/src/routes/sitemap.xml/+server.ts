import { getAllCategories } from '$lib/server/categories';
import { siteConfig, getCanonicalUrl } from '$lib/config/site';

export async function GET({ fetch, setHeaders }) {
	setHeaders({
		'content-type': 'application/xml; charset=utf-8',
		'cache-control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400'
	});

	const categories = await getAllCategories(fetch);
	const today = new Date().toISOString().split('T')[0];

	// Static pages with their priority and change frequency
	const staticPages = [
		{ path: '/', priority: '1.0', changefreq: 'daily' },
		{ path: '/categories', priority: '0.9', changefreq: 'daily' }
	];

	const staticUrls = staticPages
		.map(
			(page) => `  <url>
    <loc>${getCanonicalUrl(page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
		)
		.join('\n');

	// Dynamic category discovery pages with Google Image sitemap tags
	const categoryUrls = categories
		.map((cat) => {
			const loc = getCanonicalUrl(`/discover/${cat.slug}`);
			const imageXml = cat.image?.url
				? `\n    <image:image>
      <image:loc>${cat.image.url}</image:loc>
      <image:title>${cat.name} Music Discovery</image:title>
    </image:image>`
				: '';

			return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>`;
		})
		.join('\n');

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${categoryUrls}
</urlset>`;

	return new Response(sitemap.trim());
}
