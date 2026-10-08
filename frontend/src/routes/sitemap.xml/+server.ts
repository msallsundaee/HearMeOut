import { getAllCategories } from '$lib/server/categories';
import { siteConfig } from '$lib/config/site';

function xmlEscape(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export async function GET({ url, fetch, setHeaders }) {
	setHeaders({
		'content-type': 'application/xml; charset=utf-8',
		'cache-control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400'
	});

	const categories = await getAllCategories(fetch);
	const today = new Date().toISOString().split('T')[0];
	const baseUrl = url.origin && !url.origin.includes('localhost') ? url.origin : siteConfig.url;
	const buildLoc = (path: string) =>
		xmlEscape(`${baseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : '/' + path}`);

	// Static pages with their priority and change frequency
	const staticPages = [
		{ path: '/', priority: '1.0', changefreq: 'daily' },
		{ path: '/categories', priority: '0.9', changefreq: 'daily' }
	];

	const staticUrls = staticPages
		.map(
			(page) => `  <url>
    <loc>${buildLoc(page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
		)
		.join('\n');

	// Dynamic category discovery pages
	const categoryUrls = categories
		.map(
			(cat) => `  <url>
    <loc>${buildLoc(`/discover/${cat.slug}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
		)
		.join('\n');

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${categoryUrls}
</urlset>`;

	return new Response(sitemap.trim());
}
