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
		title: `${getMessages(locale).legal.privacy.title} | ${brand.name}`,
		alternates: await localeAlternates(locale, '/privacy'),
	};
}

export default function PrivacyPage() {
	return <LegalPageContent document="privacy" />;
}
