import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { BottomNavbar, HeaderWrapper, MainContent } from '@/components/layout';
import ModalRoot from '@/components/shared/ModalRoot/ModalRoot';
import { ToastContainer } from '@/components/ui/Toast';
import { siteConfig } from '../../site.config';
import GoogleProvider from '@/providers/GoogleProvider';
import { EnvKey } from '@event-space/shared';
import { clientEnv } from '@/config/env';
import { headers } from 'next/headers';
import { defaultLocale, isLocale, Locale, localeOpenGraph } from '@/lib/i18n/config';
import { getTranslation } from '@/stores/i18n';
import { I18nInitializer } from '@/lib/i18n/I18nInitializer';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});
async function getLocale(): Promise<Locale> {
    const localeHeader = (await headers()).get('x-locale');
    return localeHeader && isLocale(localeHeader) ? localeHeader : defaultLocale;
}

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const title = `${siteConfig.name} | ${getTranslation('common.appTitle')}`;
    const description = getTranslation('common.appDescription');

    return {
        metadataBase: new URL(clientEnv[EnvKey.FRONTEND_URL] || 'http://localhost:3000'),
        title,
        description,
        icons: {
            icon: '/favicon.ico',
            shortcut: '/favicon.ico',
            apple: [{ url: siteConfig.ogImage, sizes: '180x180', type: 'image/png' }],
        },
        openGraph: {
            title,
            description,
            images: [
                {
                    url: siteConfig.ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${siteConfig.name} Logo`,
                },
            ],
            type: 'website',
            locale: localeOpenGraph[locale as keyof typeof localeOpenGraph] || 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [siteConfig.ogImage],
        },
    };
}

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();
	const googleClientId = clientEnv[EnvKey.GOOGLE_CLIENT_ID];

	if (!googleClientId) {
		throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
	}

	return (
		<html lang={locale} translate="no" className="notranslate" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} text-primary flex h-screen flex-col overflow-hidden bg-gray-100 antialiased dark:bg-gray-900 dark:text-white`}
			>
				<I18nInitializer locale={locale} />
				<QueryProvider>
					<GoogleProvider clientId={googleClientId}>
						<HeaderWrapper />
						<MainContent>{children}</MainContent>
						<ModalRoot />
						<BottomNavbar />
						<ToastContainer />
					</GoogleProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
