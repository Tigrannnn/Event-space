import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import QueryProvider from '@/providers/QueryProvider';
import { BottomNavbar, HeaderWrapper, MainContent } from '@/components/layout';
import ModalRoot from '@/components/shared/ModalRoot/ModalRoot';
import { ToastContainer } from '@/components/ui/Toast';
import { siteConfig } from '../../../site.config';
import GoogleProvider from '@/providers/GoogleProvider';
import { EnvKey } from '@event-space/shared';
import { clientEnv } from '@/config/env';
import { defaultLocale, isLocale, localeOpenGraph } from '@/lib/i18n/config';
import { translate } from '@/lib/i18n/messages';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

interface LocaleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const currentLocale = isLocale(locale) ? locale : defaultLocale;

    const title = `${siteConfig.name} | ${translate(currentLocale, 'common.appTitle')}`;
    const description = translate(currentLocale, 'common.appDescription');

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
            locale: localeOpenGraph[currentLocale as keyof typeof localeOpenGraph] || 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [siteConfig.ogImage],
        },
    };
}

export default async function LocaleLayout({ children }: LocaleLayoutProps) {
    const googleClientId = clientEnv[EnvKey.GOOGLE_CLIENT_ID];

    if (!googleClientId) {
        throw new Error('Missing GOOGLE_CLIENT_ID environment variable');
    }

    return (
       <div className={`${geistSans.variable} ${geistMono.variable} text-primary flex h-screen flex-col overflow-hidden bg-gray-100 antialiased dark:bg-gray-900 dark:text-white`}>
            <QueryProvider>
                <GoogleProvider clientId={googleClientId}>
                    <HeaderWrapper />
                    <MainContent>{children}</MainContent>
                    <ModalRoot />
                    <BottomNavbar />
                    <ToastContainer />
                </GoogleProvider>
            </QueryProvider>
        </div>
    );
}
