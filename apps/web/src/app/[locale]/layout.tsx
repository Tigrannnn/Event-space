import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Manrope, Noto_Sans_Armenian } from 'next/font/google';
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
import { getRequestSiteUrl } from '@/lib/site-url';
import { translate } from '@/lib/i18n/messages';
import '../globals.css';

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	// Lets the page fill the screen edge to edge, which is what makes
	// env(safe-area-inset-*) report anything but zero — the bottom nav uses it to
	// clear the home indicator.
	viewportFit: 'cover',
};

// Latin/Cyrillic come from Manrope; Armenian glyphs fall through to Noto Sans
// Armenian via the font stack in globals.css (no single family covers all three).
const fontSans = Manrope({
	variable: '--font-sans-latin',
	subsets: ['latin', 'cyrillic'],
	weight: ['400', '500', '600', '700', '800'],
	display: 'swap',
});

const fontArmenian = Noto_Sans_Armenian({
	variable: '--font-sans-armenian',
	subsets: ['armenian'],
	weight: ['400', '500', '600', '700'],
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
		// The request's own origin, so a company's demo subdomain serves its own logo rather than
		// pointing every preview at the main domain.
		metadataBase: new URL(await getRequestSiteUrl()),
		title,
		description,
		icons: {
			icon: brand.ogImage,
			shortcut: brand.ogImage,
			apple: [{ url: brand.ogImage, sizes: '180x180', type: 'image/png' }],
		},
		openGraph: {
			title,
			description,
			siteName: brand.name,
			// No width/height: these are logos of whatever size the company sent, and declaring a
			// size they don't have makes a messenger lay the preview out for an image that never
			// arrives.
			images: [{ url: brand.ogImage, alt: `${brand.name} Logo` }],
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
		<html
			lang={locale}
			translate="no"
			className={`notranslate ${fontSans.variable} ${fontArmenian.variable} ${geistMono.variable}`}
			suppressHydrationWarning
		>
			<head>
				<style>{`:root { --color-primary: ${brand.colorPrimary}; --color-accent: ${brand.colorAccent}; }`}</style>
				{/* Read at request time so the API origin follows the running
				    environment instead of being frozen into the built bundle. */}
				<script
					dangerouslySetInnerHTML={{
						__html: `window.__PUBLIC_API_URL__=${JSON.stringify(process.env.PUBLIC_API_URL ?? '')};`,
					}}
				/>
				{/* Umami: cookie-less analytics, so no consent banner is needed. The id is
				    per-deployment, and omitting it simply leaves local runs untracked. */}
				{process.env.UMAMI_WEBSITE_ID && (
					<script
						defer
						src="https://cloud.umami.is/script.js"
						data-website-id={process.env.UMAMI_WEBSITE_ID}
					/>
				)}
			</head>
			<body
				className="text-black flex min-h-dvh flex-col bg-gray-100 antialiased dark:bg-gray-900 dark:text-white"
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
