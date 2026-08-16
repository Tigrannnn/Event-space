import { siteConfig } from '../../site.config';

export interface Brand {
	name: string;
	colorPrimary: string;
	colorAccent: string;
	description: string;
	ogImage: string;
}

const defaultBrand: Brand = {
	name: siteConfig.name,
	colorPrimary: '#1a7000',
	colorAccent: '#008391',
	description: siteConfig.description,
	ogImage: siteConfig.ogImage,
};

/**
 * Hostname -> brand. Add one entry per demo subdomain, no rebuild needed —
 * colors/name are resolved per-request from the Host header.
 * TODO: replace placeholder colors/ogImage with each company's real ones.
 */
const brands: Record<string, Brand> = {
	'mygarni.example.com': {
		name: 'MyGarni',
		colorPrimary: '#c2410c',
		colorAccent: '#0f766e',
		description: siteConfig.description,
		ogImage: '/brands/mygarni-logo.png',
	},
	'meetdilijan.example.com': {
		name: 'Meet Dilijan',
		colorPrimary: '#166534',
		colorAccent: '#7c3aed',
		description: siteConfig.description,
		ogImage: '/brands/meetdilijan-logo.png',
	},
	'onewaytour.example.com': {
		name: 'Oneway Tour',
		colorPrimary: '#1d4ed8',
		colorAccent: '#ea580c',
		description: siteConfig.description,
		ogImage: '/brands/onewaytour-logo.png',
	},
};

export function getBrandForHost(host: string | null): Brand {
	if (!host) return defaultBrand;

	const hostname = host.split(':')[0].toLowerCase();
	return brands[hostname] ?? defaultBrand;
}
