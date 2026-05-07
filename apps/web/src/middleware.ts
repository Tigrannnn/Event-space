import { NextRequest, NextResponse } from 'next/server';
import { EnvKey } from '@event-space/shared/enums';

const BASE_URL = process.env[EnvKey.API_URL] || 'http://localhost:5000';
// Обновляем токен за 30 секунд до истечения, чтобы избежать expired-запросов
const REFRESH_BEFORE_EXPIRY_SECONDS = 30;

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

export async function middleware(request: NextRequest): Promise<NextResponse> {
	const accessToken = request.cookies.get('accessToken')?.value;
	const refreshToken = request.cookies.get('refreshToken')?.value;

	if (!refreshToken || !isAccessTokenExpiringSoon(accessToken)) {
		return NextResponse.next();
	}

	try {
		const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
			method: 'POST',
			headers: { Cookie: getCookieHeader(request) },
			cache: 'no-store',
		});

		if (!refreshResponse.ok) return NextResponse.next();

		const setCookieHeaders = getSetCookieHeaders(refreshResponse.headers);

		if (!setCookieHeaders.length) return NextResponse.next();

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

		const response = NextResponse.next({ request: { headers: requestHeaders } });

		for (const header of setCookieHeaders) {
			response.headers.append('Set-Cookie', header);
		}

		return response;
	} catch {
		return NextResponse.next();
	}
}

export const config = {
	matcher: ['/admin/:path*', '/profile/:path*'],
};