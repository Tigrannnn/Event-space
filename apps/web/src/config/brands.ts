import { Locale } from '@event-space/shared';
import { siteConfig } from '../../site.config';

export interface BrandContact {
	instagram?: string;
	phone?: string;
	email?: string;
	location?: { address: string; mapsUrl: string };
}

export interface BrandAboutContent {
	tagline: string;
	missionBody: string;
	storyBody: string;
	contactBody: string;
}

export interface Brand {
	name: string;
	colorPrimary: string;
	colorAccent: string;
	description: string;
	ogImage: string;
	contact: BrandContact;
	about: Record<Locale, BrandAboutContent>;
}

const defaultAbout: Record<Locale, BrandAboutContent> = {
	ru: {
		tagline: 'Премиальная платформа бронирования мероприятий',
		missionBody: 'Добавьте описание миссии — какую проблему решает Event Space и для кого.',
		storyBody: 'Добавьте историю компании — как всё начиналось и во что выросло.',
		contactBody: 'Остались вопросы? Свяжитесь с нами в любое время.',
	},
	en: {
		tagline: 'Premium Experience-Booking Platform',
		missionBody: 'Add your mission statement here — what problem Event Space solves and for whom.',
		storyBody: 'Add your story here — how the company started and what it has grown into.',
		contactBody: 'Have questions? Reach out to us anytime.',
	},
	hy: {
		tagline: 'Պրեմիում փորձառության ամրագրման հարթակ',
		missionBody: 'Ավելացրեք ձեր առաքելության նկարագրությունը՝ ինչ խնդիր է լուծում Event Space-ը և ում համար։',
		storyBody: 'Ավելացրեք ձեր պատմությունը՝ ինչպես է սկսվել ընկերությունը և ինչի է վերածվել այժմ։',
		contactBody: 'Հարցեր ունե՞ք: Կապվեք մեզ հետ ցանկացած ժամանակ։',
	},
};

const defaultBrand: Brand = {
	name: siteConfig.name,
	colorPrimary: '#1a7000',
	colorAccent: '#008391',
	description: siteConfig.description,
	ogImage: siteConfig.ogImage,
	contact: {
		instagram: 'https://instagram.com/eventspace',
		phone: '+374 99 123 456',
		email: 'info@eventspace.am',
		location: { address: 'Yerevan, Armenia', mapsUrl: 'https://maps.google.com/?q=Yerevan+Armenia' },
	},
	about: defaultAbout,
};

/**
 * Filler "About" copy for demo subdomains — swap for the client's real mission
 * and story before a pitch or launch, same as colors/contact below.
 */
const placeholderAbout = (name: string): Record<Locale, BrandAboutContent> => ({
	ru: {
		tagline: `Бронирование туров и мероприятий от ${name}`,
		missionBody: `TODO: описание миссии ${name} — какую проблему решает и для кого.`,
		storyBody: `TODO: история компании ${name}.`,
		contactBody: 'Остались вопросы? Свяжитесь с нами в любое время.',
	},
	en: {
		tagline: `Tour and event booking by ${name}`,
		missionBody: `TODO: ${name}'s mission statement — what problem it solves and for whom.`,
		storyBody: `TODO: ${name}'s story — how it started and what it has grown into.`,
		contactBody: 'Have questions? Reach out to us anytime.',
	},
	hy: {
		tagline: `Տուրերի և միջոցառումների ամրագրում ${name}-ից`,
		missionBody: `TODO: ${name}-ի առաքելության նկարագրությունը։`,
		storyBody: `TODO: ${name}-ի պատմությունը։`,
		contactBody: 'Հարցեր ունե՞ք: Կապվեք մեզ հետ ցանկացած ժամանակ։',
	},
});

/**
 * Hostname -> brand. Add one entry per demo subdomain, no rebuild needed —
 * colors/name/contact/about are resolved per-request from the Host header.
 * TODO: replace placeholder colors/ogImage/contact/about with each company's real ones.
 */
const brands: Record<string, Brand> = {
	'mygarni.event-space.space': {
		name: 'MyGarni',
		colorPrimary: '#c2410c',
		colorAccent: '#0f766e',
		description: siteConfig.description,
		ogImage: '/brands/mygarni-logo.png',
		contact: {
			instagram: 'https://instagram.com/mygarni',
			phone: '+374 99 000 000',
			email: 'info@mygarni.am',
			location: { address: 'Yerevan, Armenia', mapsUrl: 'https://maps.google.com/?q=Yerevan+Armenia' },
		},
		about: placeholderAbout('MyGarni'),
	},
	'meetdilijan.event-space.space': {
		name: 'Meet Dilijan',
		colorPrimary: '#166534',
		colorAccent: '#7c3aed',
		description: siteConfig.description,
		ogImage: '/brands/meetdilijan-logo.png',
		contact: {
			instagram: 'https://instagram.com/meetdilijan',
			phone: '+374 99 000 000',
			email: 'info@meetdilijan.am',
			location: { address: 'Dilijan, Armenia', mapsUrl: 'https://maps.google.com/?q=Dilijan+Armenia' },
		},
		about: placeholderAbout('Meet Dilijan'),
	},
	'onewaytour.event-space.space': {
		name: 'Oneway Tour',
		colorPrimary: '#1d4ed8',
		colorAccent: '#ea580c',
		description: siteConfig.description,
		ogImage: '/brands/onewaytour-logo.png',
		contact: {
			instagram: 'https://instagram.com/onewaytour',
			phone: '+374 99 000 000',
			email: 'info@onewaytour.am',
			location: { address: 'Yerevan, Armenia', mapsUrl: 'https://maps.google.com/?q=Yerevan+Armenia' },
		},
		about: placeholderAbout('Oneway Tour'),
	},
};

export function getBrandForHost(host: string | null): Brand {
	if (!host) return defaultBrand;

	const hostname = host.split(':')[0].toLowerCase();
	return brands[hostname] ?? defaultBrand;
}
