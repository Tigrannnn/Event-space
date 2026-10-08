import { Metadata } from 'next';
import { headers } from 'next/headers';
import LegalPageContent from '../legal/LegalPageContent';
import { getRequestLocale, localeAlternates } from '@/lib/seo';
import { getBrandForHost } from '@/config/brands';
import { getMessages } from '@/lib/i18n/messages';

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getRequestLocale();
	const brand = getBrandForHost((await headers()).get('host'));

	return {
		title: `${getMessages(locale).legal.terms.title} | ${brand.name}`,
		alternates: await localeAlternates(locale, '/terms'),
	};
}

export default function TermsPage() {
	return <LegalPageContent document="terms" />;
}
