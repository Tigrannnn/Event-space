import { Metadata } from 'next';
import AboutPageContent from './AboutPageContent';
import { getRequestLocale, localeAlternates } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
	// Reads the request's locale rather than being a constant, because the canonical URL of this
	// page differs per language and hreflang has to name the one the visitor is actually on.
	const locale = await getRequestLocale();

	return {
		title: 'About Us | Event Space',
		description: 'Learn more about Event Space',
		alternates: localeAlternates(locale, '/about'),
	};
}

export default function AboutPage() {
	return <AboutPageContent />;
}
