import type { Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css'; 
import { defaultLocale, isLocale } from '@/lib/i18n/config';

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
    const localeHeader = (await headers()).get('x-locale');
    const locale = localeHeader && isLocale(localeHeader) ? localeHeader : defaultLocale;

    return(
        <html lang={locale} translate="no" className="notranslate" suppressHydrationWarning>
            <body>
                {children}
            </body>
        </html>
    )
}
