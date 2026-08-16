import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import QueryProvider from '@/providers/QueryProvider';
import { BottomNavbar, HeaderWrapper, MainContent } from '@/components/layout';
import ModalRoot from '@/components/shared/ModalRoot/ModalRoot';
import { ToastContainer } from '@/components/ui/Toast';
import GoogleProvider from '@/providers/GoogleProvider';
import { BrandProvider } from '@/providers/BrandProvider';
import { getBrandForHost } from '@/config/brands';
import { EnvKey } from '@event-space/shared';
import { clientEnv } from '@/config/env';
import { defaultLocale, isLocale, localeOpenGraph } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/messages';
import localFont from 'next/font/local';
import '../globals.css';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

const fontSans = localFont({
	src: [
		{ path: '../../fonts/OpenSans.ttf' },
	],
	variable: '--font-sans',
	display: 'swap',
});


const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

interface LayoutProps {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const currentLocale = isLocale(locale) ? locale : defaultLocale;
	const brand = getBrandForHost((await headers()).get('host'));

	const title = `${brand.name} | ${translate(currentLocale, 'common.appTitle')}`;
	const description = translate(currentLocale, 'common.appDescription');

	return {
		metadataBase: new URL(clientEnv[EnvKey.FRONTEND_URL] || 'http://localhost:3000'),
		title,
		description,
		icons: {
			icon: '/favicon.ico',
			shortcut: '/favicon.ico',
			apple: [{ url: brand.ogImage, sizes: '180x180', type: 'image/png' }],
		},
		openGraph: {
			title,
			description,
			images: [
				{
					url: brand.ogImage,
					width: 1200,
					height: 630,
					alt: `${brand.name} Logo`,
				},
			],
			type: 'website',
			locale: localeOpenGraph[currentLocale as keyof typeof localeOpenGraph] || 'en_US',
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [brand.ogImage],
		},
	};
}

export default async function Layout({ children, params }: LayoutProps) {
	const { locale } = await params;
	const googleClientId = clientEnv[EnvKey.GOOGLE_CLIENT_ID];
	const brand = getBrandForHost((await headers()).get('host'));

	if (!googleClientId) {
		throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
	}

	return (
		<html lang={locale} translate="no" className="notranslate" suppressHydrationWarning>
			<head>
				<style>{`:root { --color-primary: ${brand.colorPrimary}; --color-accent: ${brand.colorAccent}; }`}</style>
			</head>
			<body
				className={`${fontSans.variable} ${geistMono.variable} text-black flex h-screen flex-col bg-gray-100 antialiased dark:bg-gray-900 dark:text-white`}
			>
				<BrandProvider brand={brand}>
					<QueryProvider>
						<GoogleProvider clientId={googleClientId}>
							<HeaderWrapper />
							<MainContent>{children}</MainContent>
							<ModalRoot />
							<BottomNavbar />
							<ToastContainer />
						</GoogleProvider>
					</QueryProvider>
				</BrandProvider>
			</body>
		</html>
	);
}
