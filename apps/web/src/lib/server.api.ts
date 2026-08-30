import { cookies } from 'next/headers';
import { EnvKey } from '@event-space/shared';

const BASE_URL = process.env[EnvKey.API_URL] || 'http://localhost:5000';

type RefreshedTokens = Record<string, string>;

/**
 * Refresh tokens are single-use: the API deletes the record and issues a new
 * pair, so a second call with the same token is rejected as reuse. A page like
 * /admin renders several authenticated fetches at once (layout plus page), and
 * without coordination each one would try to spend the same token — the first
 * wins and the rest fail. Concurrent callers therefore share one refresh,
 * keyed by the token being spent, and reuse whatever it returns.
 */
const refreshesInFlight = new Map<string, Promise<RefreshedTokens | null>>();

async function refreshTokens(
	refreshToken: string,
	cookieHeader: string,
): Promise<RefreshedTokens | null> {
	const pending = refreshesInFlight.get(refreshToken);
	if (pending) return pending;

	const attempt = (async (): Promise<RefreshedTokens | null> => {
		const res = await fetch(`${BASE_URL}/auth/refresh`, {
			method: 'POST',
			headers: { Cookie: cookieHeader },
			cache: 'no-store',
		});

		if (!res.ok) return null;

		const updated: RefreshedTokens = {};
		for (const cookie of res.headers.getSetCookie?.() ?? []) {
			const [nameValue] = cookie.split(';');
			const separator = nameValue.indexOf('=');
			if (separator === -1) continue;
			updated[nameValue.slice(0, separator).trim()] = nameValue.slice(separator + 1).trim();
		}

		return updated;
	})();

	refreshesInFlight.set(refreshToken, attempt);
	attempt.finally(() => refreshesInFlight.delete(refreshToken));

	return attempt;
}

export async function serverFetch<T = unknown>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const cookieStore = await cookies();

	// Overrides hold the refreshed pair for this render: writing to the cookie
	// store is only permitted in actions and route handlers, so a page render
	// has to carry them itself.
	const overrides: RefreshedTokens = {};

	const readCookie = (name: string) => overrides[name] ?? cookieStore.get(name)?.value;

	const buildCookieHeader = () => {
		const merged = new Map<string, string>();
		for (const { name, value } of cookieStore.getAll()) merged.set(name, value);
		for (const [name, value] of Object.entries(overrides)) merged.set(name, value);

		return [...merged].map(([name, value]) => `${name}=${value}`).join('; ');
	};

	const makeRequest = () => {
		const accessToken = readCookie('accessToken');
		return fetch(`${BASE_URL}${endpoint}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				...Object.fromEntries(new Headers(options.headers)),
				...(accessToken && { Authorization: `Bearer ${accessToken}` }),
				Cookie: buildCookieHeader(),
			},
			cache: 'no-store',
		});
	};

	let res = await makeRequest();

	if (res.status === 401 && !endpoint.startsWith('/auth')) {
		const refreshToken = readCookie('refreshToken');
		if (!refreshToken) throw new Error('Refresh failed');

		const refreshed = await refreshTokens(refreshToken, buildCookieHeader());
		if (!refreshed) throw new Error('Refresh failed');

		Object.assign(overrides, refreshed);

		for (const [name, value] of Object.entries(refreshed)) {
			// Best effort: keeps the browser in sync where the context allows it.
			try {
				cookieStore.set(name, value);
			} catch {
				// Read-only during a page render; the overrides above still apply.
			}
		}

		res = await makeRequest();
	}

	if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
	return res.json();
}
