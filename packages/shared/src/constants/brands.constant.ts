import { Locale } from '../schemas/locale.schema';

export const siteConfig = {
	name: 'Event Space',
	description: 'Premium platform for local events and unique adventures',
	ogImage: '/favicon.ico',
};

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
	'onedaytour.event-space.space': {
		name: 'One Day Tour',
		colorPrimary: '#2d68a6',
		colorAccent: '#cc8100',
		description: siteConfig.description,
		ogImage: '/brands/onedaytour-logo.png',
		contact: {
			instagram: 'https://instagram.com/one_day_tour_armenia',
			phone: '+374 91 967636',
			email: 'info@onedaytour.am',
			location: { address: 'Yerevan, Armenia', mapsUrl: 'https://maps.google.com/?q=Yerevan+Armenia' },
		},
		about: {
			ru: {
				...placeholderAbout('One Day Tour').ru,
				tagline: 'Discover Armenia',
			},
			en: {
				...placeholderAbout('One Day Tour').en,
				tagline: 'Discover Armenia',
			},
			hy: {
				...placeholderAbout('One Day Tour').hy,
				tagline: 'Discover Armenia',
			},
		},
	},
	'110places.event-space.space': {
		name: '110 Places',
		colorPrimary: '#0c6323',
		colorAccent: '#a28700',
		description: siteConfig.description,
		ogImage: '/brands/110places-logo.png',
		contact: {
			instagram: 'https://www.instagram.com/110_places/',
			phone: '+374 41 200110',
			email: 'info@110places.am',
			location: { address: 'Yerevan, Armenia', mapsUrl: 'https://maps.google.com/?q=Yerevan+Armenia' },
		},
		about: placeholderAbout('110 Places'),
	},
	// Real prospect (not a placeholder): @1000_1travel_ on Instagram.
	// Logo, phone and address are theirs; no email given, so none is shown.
	// Subdomain is "1001" — how "1000+1" reads aloud, easy to dictate. Their handle's "_"
	// can't be used: underscores aren't valid in hostnames and HTTPS certificates won't cover them.
	// Primary is their orange darkened (#EC8232 → #CD6313) so white button text stays legible.
	'1001travel.event-space.space': {
		name: '1000+1 Travel',
		colorPrimary: '#CD6313',
		colorAccent: '#4C9FD7',
		description: siteConfig.description,
		ogImage: '/brands/1001travel-logo.png',
		contact: {
			instagram: 'https://www.instagram.com/1000_1travel_/',
			email: '1000.1travel@gmail.com',
			phone: '+374 91 772211',
			location: {
				address: 'Ք. Երևան, Պռոշյան 2/1',
				mapsUrl: 'https://maps.google.com/?q=Proshyan+2%2F1,+Yerevan,+Armenia',
			},
		},
		about: placeholderAbout('1000+1 Travel'),
	},
	// Real prospect (not a placeholder): @yerivar_tours on Instagram.
	// They gave one colour, #22544E, too dark and too muted to carry a site — the primary is
	// that teal brightened. The accent shifts the hue towards blue at the same brightness
	// rather than simply going lighter, so the pair reads as two colours.
	'yerivar.event-space.space': {
		name: 'Yerivar',
		colorPrimary: '#1E8F82',
		colorAccent: '#227CA0',
		description: siteConfig.description,
		ogImage: '/brands/yerivar-logo.png',
		contact: {
			instagram: 'https://www.instagram.com/yerivar_tours/',
			email: 'info@yerivar.am',
			phone: '+374 91 032743',
			location: { address: 'Yerevan, Armenia', mapsUrl: 'https://maps.google.com/?q=Yerevan+Armenia' },
		},
		about: placeholderAbout('Yerivar'),
	},
	'ampar.event-space.space': {
		name: 'Ampar',
		colorPrimary: '#6055BE',
		colorAccent: '#BD4A4B',
		description: siteConfig.description,
		ogImage: '/brands/ampar-logo.png',
		contact: {
			instagram: 'https://www.instagram.com/ampar_travel',
			phone: '+374 94 358075',
			email: 'info@ampartravel.am',
			location: {
				address: 'ք. Երևան, Տիգրան Մեծ 40',
				mapsUrl: 'https://maps.google.com/?q=Tigran+Mets+40,+Yerevan,+Armenia',
			},
		},
		about: placeholderAbout('Ampar'),
	},
	'dilitour.event-space.space': {
		name: 'Dili Tour',
		colorPrimary: '#BE6926',
		colorAccent: '#BE4E26',
		description: siteConfig.description,
		ogImage: '/brands/dilitour-logo.png',
		contact: {
			instagram: 'https://www.instagram.com/dili_tours/',
			phone: '+374 94 016966',
			email: 'info@dilitour.am',
			location: { address: 'Dilijan, Armenia', mapsUrl: 'https://maps.google.com/?q=Dilijan+Armenia' },
		},
		about: placeholderAbout('Dili Tour'),
	},
	'expresstour.event-space.space': {
		name: 'Express Tours',
		colorPrimary: '#85182c',
		colorAccent: '#c2a86b',
		description: siteConfig.description,
		ogImage: '/brands/express-logo.png',
		contact: {
			email: 'info@expresstour.am',
			phone: '+374 93 132525',
			location: {
				address: 'Azatutyan 24/19, Yerevan, Armenia',
				mapsUrl: 'https://maps.google.com/?q=Azatutyan+24%2F19,+Yerevan,+Armenia',
			},
		},
		about: placeholderAbout('Express Tours'),
	},
	'rstour.event-space.space': {
		name: 'RS Tour',
		colorPrimary: '#E6572D',
		colorAccent: '#f78c12',
		description: siteConfig.description,
		ogImage: '/brands/rstour-logo.png',
		contact: {
			instagram: 'https://www.instagram.com/rstour_armenia/',
			phone: '+374 96 578656',
			email: 'info@rstour.am',
			location: { address: 'Yerevan, Armenia', mapsUrl: 'https://maps.google.com/?q=Yerevan+Armenia' },
		},
		about: placeholderAbout('RS Tour'),
	},
	'buggytour.event-space.space': {
		name: 'Buggy Tour',
		colorPrimary: '#089439',
		colorAccent: '#8E8229',
		description: siteConfig.description,
		ogImage: '/brands/buggytour-logo.png',
		contact: {
			instagram: 'https://www.instagram.com/buggytourarmenia/',
			phone: '+374 77 550995',
			email: 'info@buggytour.am',
			location: { address: 'Yerevan, Armenia', mapsUrl: 'https://maps.google.com/?q=Yerevan+Armenia' },
		},
		about: placeholderAbout('Buggy Tour'),
	},
	'syuniktour.event-space.space': {
		name: 'Syunik Tour',
		colorPrimary: '#238B30',
		colorAccent: '#978211',
		description: siteConfig.description,
		ogImage: '/brands/syuniqtour-logo.png',
		contact: {
			instagram: 'https://www.instagram.com/syunik_tour_armenia/',
			phone: '+374 77 934403',
			email: 'info@syuniktour.am',
			location: { address: 'Yerevan, Armenia', mapsUrl: 'https://maps.google.com/?q=Yerevan+Armenia' },
		},
		about: placeholderAbout('Syunik Tour'),
	},
};

export function getBrandForHost(host: string | null): Brand {
	if (!host) return defaultBrand;

	const hostname = host.split(':')[0].toLowerCase();
	return brands[hostname] ?? defaultBrand;
}
