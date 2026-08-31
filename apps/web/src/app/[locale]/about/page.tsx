import { Metadata } from 'next';
import { headers } from 'next/headers';
import AboutPageContent from './AboutPageContent';
import { getRequestLocale, localeAlternates } from '@/lib/seo';
import { getBrandForHost } from '@/config/brands';

export async function generateMetadata(): Promise<Metadata> {
	// Reads the request's locale rather than being a constant, because the canonical URL of this
	// page differs per language and hreflang has to name the one the visitor is actually on.
	const locale = await getRequestLocale();
	const brand = getBrandForHost((await headers()).get('host'));

	return {
		title: `About Us | ${brand.name}`,
		description: `Learn more about ${brand.name}`,
		alternates: localeAlternates(locale, '/about'),
	};
}

export default function AboutPage() {
	return <AboutPageContent />;
}
