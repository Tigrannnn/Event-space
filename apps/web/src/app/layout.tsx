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

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	metadataBase: new URL(clientEnv[EnvKey.FRONTEND_URL] || 'http://localhost:3000'),
	title: `${siteConfig.name} | Local Events & Adventures`,
	description: `${siteConfig.description}`,
	icons: {
		icon: '/favicon.ico',
		shortcut: '/favicon.ico',
		apple: [{ url: siteConfig.ogImage, sizes: '180x180', type: 'image/png' }],
	},
	openGraph: {
		title: `${siteConfig.name} | Local Events & Adventures`,
		description: `${siteConfig.description}`,
		images: [
			{
				url: siteConfig.ogImage,
				width: 1200,
				height: 630,
				alt: `${siteConfig.name} Logo`,
			},
		],
		type: 'website',
		locale: 'en_US',
	},
	twitter: {
		card: 'summary_large_image',
		title: `${siteConfig.name} | Local Events & Adventures`,
		description: `${siteConfig.description}`,
		images: [siteConfig.ogImage],
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const googleClientId = clientEnv[EnvKey.GOOGLE_CLIENT_ID];

	if (!googleClientId) {
		throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
	}

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} text-primary flex h-screen flex-col overflow-hidden bg-gray-100 antialiased dark:bg-gray-900 dark:text-white`}
			>
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
