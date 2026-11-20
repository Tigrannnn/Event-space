import {
	normalizeSourceRef,
	SOURCE_REF_COOKIE,
	SOURCE_REF_MAX_AGE_DAYS,
	SOURCE_REF_PARAMS,
} from '@event-space/shared';

export function refFromSearch(search: string): string | null {
	const params = new URLSearchParams(search);
	for (const name of SOURCE_REF_PARAMS) {
		const ref = normalizeSourceRef(params.get(name));
		if (ref) return ref;
	}
	return null;
}

export function rememberSourceRef(ref: string): void {
	const maxAge = SOURCE_REF_MAX_AGE_DAYS * 24 * 60 * 60;
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${SOURCE_REF_COOKIE}=${encodeURIComponent(ref)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export function readSourceRef(): string | undefined {
	if (typeof document === 'undefined') return undefined;

	const entry = document.cookie
		.split('; ')
		.find((part) => part.startsWith(`${SOURCE_REF_COOKIE}=`));
	if (!entry) return undefined;

	return normalizeSourceRef(decodeURIComponent(entry.slice(SOURCE_REF_COOKIE.length + 1))) ?? undefined;
}
