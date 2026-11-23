import { z } from './openapi';
import { SourceSchema as GeneratedSourceSchema } from '../generated/modelSchema/SourceSchema';
import { SourceKindSchema } from '../generated/inputTypeSchemas/SourceKindSchema';

export const SOURCE_NAME_MAX = 80;
export const SOURCE_CODE_MAX = 60;
export const SOURCE_REF_COOKIE = 'es_ref';
export const SOURCE_REF_MAX_AGE_DAYS = 30;
export const SOURCE_REF_PARAMS = ['ref', 'utm_source'] as const;

export const SOURCE_FILTER_NONE = 'none';

export const SourceKindEnum = SourceKindSchema;
export type SourceKind = z.infer<typeof SourceKindEnum>;

export const PLATFORM_CODES = [
	'instagram',
	'facebook',
	'google',
	'telegram',
	'whatsapp',
	'tiktok',
	'other',
	'direct',
] as const;

export type PlatformCode = (typeof PLATFORM_CODES)[number];

export const DIRECT_SOURCE_CODE: PlatformCode = 'direct';
export const OTHER_SITES_SOURCE_CODE: PlatformCode = 'other';

const PLATFORM_ALIASES: Record<string, PlatformCode> = {
	ig: 'instagram',
	insta: 'instagram',
	fb: 'facebook',
	meta: 'facebook',
	tg: 'telegram',
	wa: 'whatsapp',
	tt: 'tiktok',
};

const PLATFORM_HOSTS: [RegExp, PlatformCode][] = [
	[/(^|\.)instagram\.com$/, 'instagram'],
	[/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, 'facebook'],
	[/(^|\.)google\.[a-z.]+$/, 'google'],
	[/(^|\.)(t\.me|telegram\.org|telegram\.me)$/, 'telegram'],
	[/(^|\.)(wa\.me|whatsapp\.com)$/, 'whatsapp'],
	[/(^|\.)tiktok\.com$/, 'tiktok'],
];

const PLATFORM_APPS: [RegExp, PlatformCode][] = [
	[/^com\.instagram\./, 'instagram'],
	[/^com\.facebook\./, 'facebook'],
	[/^com\.google\./, 'google'],
	[/^org\.telegram\./, 'telegram'],
	[/^com\.whatsapp/, 'whatsapp'],
	[/^com\.zhiliaoapp\.musically|^com\.ss\.android\.ugc/, 'tiktok'],
];

const SOURCE_CODE_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

export function normalizeSourceRef(raw: string | null | undefined): string | null {
	if (!raw) return null;
	const ref = raw.trim().toLowerCase();
	if (ref.length === 0 || ref.length > SOURCE_CODE_MAX) return null;
	if (!SOURCE_CODE_PATTERN.test(ref)) return null;
	return PLATFORM_ALIASES[ref] ?? ref;
}

export function isPlatformCode(code: string): code is PlatformCode {
	return (PLATFORM_CODES as readonly string[]).includes(code);
}

export function platformFromReferrer(referrer: string, ownHost: string): PlatformCode | null {
	if (!referrer) return null;

	let url: URL;
	try {
		url = new URL(referrer);
	} catch {
		return null;
	}

	if (url.protocol === 'android-app:') {
		return PLATFORM_APPS.find(([pattern]) => pattern.test(url.hostname))?.[1] ?? OTHER_SITES_SOURCE_CODE;
	}

	const host = url.hostname.toLowerCase().replace(/^www\./, '');
	if (!host || host === ownHost.toLowerCase().replace(/^www\./, '')) return null;

	return PLATFORM_HOSTS.find(([pattern]) => pattern.test(host))?.[1] ?? OTHER_SITES_SOURCE_CODE;
}

export function sourceNameKey(name: string): string {
	return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function autoSourceNameKey(code: string): string {
	return `ref:${code}`;
}

export const SourceSchema = GeneratedSourceSchema.extend({
	id: z.string(),
});

export type Source = z.infer<typeof SourceSchema>;

export const SourceRefSchema = z.object({
	id: z.string(),
	code: z.string(),
	name: z.string(),
	kind: SourceKindEnum,
});

export type SourceRef = z.infer<typeof SourceRefSchema>;

export const SourceStatsRowSchema = z.object({
	source: SourceRefSchema.nullable(),
	visitors: z.number().int(),
	viewedTours: z.number().int(),
	startedBooking: z.number().int(),
	bookings: z.number().int(),
	siteBookings: z.number().int(),
	amount: z.number(),
});

export type SourceStatsRow = z.infer<typeof SourceStatsRowSchema>;

export const SourceStatsDaySchema = z.object({
	date: z.string(),
	visitors: z.number().int(),
	newVisitors: z.number().int(),
});

export const SourceStatsSchema = z.object({
	totals: SourceStatsRowSchema.omit({ source: true }).extend({ newVisitors: z.number().int() }),
	rows: z.array(SourceStatsRowSchema),
	days: z.array(SourceStatsDaySchema),
});

export type SourceStats = z.infer<typeof SourceStatsSchema>;

export function sourceConversion(row: Pick<SourceStatsRow, 'visitors' | 'siteBookings'>): number | null {
	if (row.visitors <= 0) return null;
	return Math.min(1, row.siteBookings / row.visitors);
}

const SourceNameSchema = z.string().trim().min(1).max(SOURCE_NAME_MAX);

const SourceCodeSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(1)
	.max(SOURCE_CODE_MAX)
	.regex(SOURCE_CODE_PATTERN, 'Latin letters, digits, "-" and "_" only')
	.refine((code) => !isPlatformCode(code) && !(code in PLATFORM_ALIASES), {
		message: 'This label belongs to a platform that is recognised by itself',
	});

export const CreateSourceSchema = z
	.object({
		name: SourceNameSchema,
		code: SourceCodeSchema,
	})
	.openapi({ description: 'A new partner, with its own link' });

export type CreateSourceData = z.infer<typeof CreateSourceSchema>;

export const UpdateSourceSchema = z
	.object({
		name: SourceNameSchema,
		isActive: z.boolean(),
	})
	.partial()
	.openapi({ description: 'Rename, archive or restore a partner' });

export type UpdateSourceData = z.infer<typeof UpdateSourceSchema>;

export const UpdateBookingSourceSchema = z
	.object({
		sourceId: z.string().min(1).nullable(),
	})
	.openapi({ description: 'Where the customer came from; null when unknown' });

export type UpdateBookingSourceData = z.infer<typeof UpdateBookingSourceSchema>;
