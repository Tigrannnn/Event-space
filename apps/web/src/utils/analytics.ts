import {
	ANALYTICS_VISIT_COOKIE,
	ANALYTICS_VISIT_IDLE_MINUTES,
	ANALYTICS_VISITOR_COOKIE,
	ANALYTICS_VISITOR_MAX_AGE_DAYS,
	type AnalyticsEventType,
} from '@event-space/shared';
import clientApi from '@/lib/client.api';
import { readSourceRef } from '@/utils/sourceRef';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sent = new Set<string>();

function readCookie(name: string): string | undefined {
	const entry = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`));
	return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
}

function newId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
		const random = (Math.random() * 16) | 0;
		return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16);
	});
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
	const secure = window.location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

function visitorId(): string {
	const existing = readCookie(ANALYTICS_VISITOR_COOKIE);
	const id = existing && UUID_PATTERN.test(existing) ? existing : newId();
	writeCookie(ANALYTICS_VISITOR_COOKIE, id, ANALYTICS_VISITOR_MAX_AGE_DAYS * 24 * 60 * 60);
	return id;
}

function continueVisit(): { id: string; isNew: boolean } {
	const today = new Date().toLocaleDateString('en-CA');
	const [existing, day] = (readCookie(ANALYTICS_VISIT_COOKIE) ?? '').split('_');
	const isNew = !existing || !UUID_PATTERN.test(existing) || day !== today;
	const id = isNew ? newId() : existing;
	writeCookie(ANALYTICS_VISIT_COOKIE, `${id}_${today}`, ANALYTICS_VISIT_IDLE_MINUTES * 60);
	return { id, isNew };
}

function trackVisit(): void {
	const visit = continueVisit();
	if (!visit.isNew) return;

	void clientApi
		.post('/analytics/track', {
			type: 'VISIT',
			visitorId: visitorId(),
			visitId: visit.id,
			ref: readSourceRef(),
		})
		.catch(() => writeCookie(ANALYTICS_VISIT_COOKIE, '', 0));
}

export function trackAnalytics(type: AnalyticsEventType, eventId?: string): void {
	if (typeof window === 'undefined') return;
	if (type === 'VISIT') return trackVisit();

	const key = `${type}:${eventId ?? ''}:${new Date().toDateString()}`;
	if (sent.has(key)) return;
	sent.add(key);

	void clientApi
		.post('/analytics/track', { type, visitorId: visitorId(), eventId, ref: readSourceRef() })
		.catch(() => sent.delete(key));
}

export function tourIdFromPath(pathname: string): string | undefined {
	const match = pathname.match(/\/events\/([0-9a-f-]{36})(?:\/|$)/i);
	return match && UUID_PATTERN.test(match[1]) ? match[1] : undefined;
}
