import { NextRequest, NextResponse } from 'next/server';
import { EnvKey } from '@event-space/shared/enums';
import {
	getLocaleFromPathname,
	getPreferredLocale,
	locales,
	stripLocaleFromPathname,
	type Locale,
} from '@/lib/i18n/config';

const BASE_URL = process.env[EnvKey.API_URL] || 'http://localhost:5000';
const REFRESH_BEFORE_EXPIRY_SECONDS = 30;
const LOCALE_COOKIE = 'event-space-locale';
const PUBLIC_FILE = /\.(.*)$/;

function getCookieHeader(request: NextRequest): string {
	return request.cookies
		.getAll()
		.map(({ name, value }) => `${name}=${value}`)
		.join('; ');
}

function getSetCookieHeaders(headers: Headers): string[] {
	return (headers as Headers & { getSetCookie?(): string[] }).getSetCookie?.() ?? [];
}

function isAccessTokenExpiringSoon(token?: string): boolean {
	if (!token) return true;

	try {
		const [, payload] = token.split('.');
		const padded = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(
			payload.length + ((4 - (payload.length % 4)) % 4),
			'=',
		);
		const { exp } = JSON.parse(atob(padded));

		if (typeof exp !== 'number') return true;

		return exp - Math.floor(Date.now() / 1000) <= REFRESH_BEFORE_EXPIRY_SECONDS;
	} catch {
		return true;
	}
}

function getRequestLocale(request: NextRequest): Locale {
	const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
	if (cookieLocale && locales.includes(cookieLocale as Locale)) {
		return cookieLocale as Locale;
	}

	return getPreferredLocale(request.headers.get('accept-language'));
}

function shouldSkipI18n(pathname: string): boolean {
	return (
		pathname.startsWith('/api') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/favicon.ico') ||
		pathname.startsWith('/logo.png') ||
		PUBLIC_FILE.test(pathname)
	);
}

async function refreshAccessTokenIfNeeded(
	request: NextRequest,
	responseFactory: (requestHeaders?: Headers) => NextResponse,
): Promise<NextResponse> {
	const accessToken = request.cookies.get('accessToken')?.value;
	const refreshToken = request.cookies.get('refreshToken')?.value;

	if (!refreshToken || !isAccessTokenExpiringSoon(accessToken)) {
		return responseFactory();
	}

	try {
		const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
			method: 'POST',
			headers: { Cookie: getCookieHeader(request) },
			cache: 'no-store',
		});

		if (!refreshResponse.ok) return responseFactory();

		const setCookieHeaders = getSetCookieHeaders(refreshResponse.headers);

		if (!setCookieHeaders.length) return responseFactory();

		const cookieMap = new Map(request.cookies.getAll().map(({ name, value }) => [name, value]));

		for (const header of setCookieHeaders) {
			const [nameValue] = header.split(';');
			const sep = nameValue.indexOf('=');
			if (sep !== -1) {
				cookieMap.set(nameValue.slice(0, sep).trim(), nameValue.slice(sep + 1).trim());
			}
		}

		const requestHeaders = new Headers(request.headers);
		requestHeaders.set(
			'Cookie',
			Array.from(cookieMap, ([name, value]) => `${name}=${value}`).join('; '),
		);
		const response = responseFactory(requestHeaders);

		for (const header of setCookieHeaders) {
			response.headers.append('Set-Cookie', header);
		}

		return response;
	} catch {
		return responseFactory();
	}
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
	const { pathname, search } = request.nextUrl;

	if (shouldSkipI18n(pathname)) {
		return NextResponse.next();
	}

	const pathLocale = getLocaleFromPathname(pathname);

	if (!pathLocale) {
		const locale = getRequestLocale(request);
		const redirectUrl = request.nextUrl.clone();
		redirectUrl.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
        redirectUrl.search = search;
		return NextResponse.redirect(redirectUrl);
	}

	const internalPathname = stripLocaleFromPathname(pathname);
	const headers = new Headers(request.headers);
	headers.set('x-locale', pathLocale);
	headers.set('x-pathname', pathname);

	const responseFactory = (requestHeaders?: Headers) => {
		const activeHeaders = requestHeaders ?? headers;
		activeHeaders.set('x-locale', pathLocale);
        activeHeaders.set('x-pathname', pathname);

		const response = NextResponse.next({
            request: { headers: activeHeaders },
		});

		response.cookies.set(LOCALE_COOKIE, pathLocale, {
			path: '/',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 365,
		});

		return response;
	};

	if (internalPathname.startsWith('/admin') || internalPathname.startsWith('/profile')) {
		return refreshAccessTokenIfNeeded(request, responseFactory);
	}

	return responseFactory();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};