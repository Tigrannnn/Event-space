import { z } from './openapi';
import { SourceSchema as GeneratedSourceSchema } from '../generated/modelSchema/SourceSchema';

export const SOURCE_NAME_MAX = 80;
export const SOURCE_CODE_MAX = 60;
export const SOURCE_REF_COOKIE = 'es_ref';
export const SOURCE_REF_MAX_AGE_DAYS = 30;
export const SOURCE_REF_PARAMS = ['ref', 'utm_source'] as const;

export const SOURCE_FILTER_NONE = 'none';
export const SOURCE_FILTER_UNKNOWN = 'unknown';

const SOURCE_CODE_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

export function normalizeSourceRef(raw: string | null | undefined): string | null {
	if (!raw) return null;
	const ref = raw.trim().toLowerCase();
	if (ref.length === 0 || ref.length > SOURCE_CODE_MAX) return null;
	return SOURCE_CODE_PATTERN.test(ref) ? ref : null;
}

export function sourceNameKey(name: string): string {
	return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export const SourceSchema = GeneratedSourceSchema.extend({
	id: z.string(),
});

export type Source = z.infer<typeof SourceSchema>;

export const SourceRefSchema = z.object({
	id: z.string(),
	code: z.string(),
	name: z.string(),
});

export type SourceRef = z.infer<typeof SourceRefSchema>;

export const SourceTotalsSchema = z.object({
	visits: z.number().int(),
	siteBookings: z.number().int(),
	bookings: z.number().int(),
	guests: z.number().int(),
	amount: z.number(),
	paid: z.number(),
});

export type SourceTotals = z.infer<typeof SourceTotalsSchema>;

export const SourceWithStatsSchema = SourceSchema.extend({
	totals: SourceTotalsSchema,
});

export type SourceWithStats = z.infer<typeof SourceWithStatsSchema>;

export const UnknownSourceRefSchema = z.object({
	ref: z.string(),
	totals: SourceTotalsSchema,
});

export type UnknownSourceRef = z.infer<typeof UnknownSourceRefSchema>;

export const SourceListSchema = z.object({
	sources: z.array(SourceWithStatsSchema),
	unknown: z.array(UnknownSourceRefSchema),
	unspecified: SourceTotalsSchema,
});

export type SourceList = z.infer<typeof SourceListSchema>;

export const SourceRevenueRowSchema = z.object({
	sourceId: z.string().nullable(),
	ref: z.string().nullable(),
	name: z.string().nullable(),
	totals: SourceTotalsSchema,
});

export type SourceRevenueRow = z.infer<typeof SourceRevenueRowSchema>;

const SourceNameSchema = z.string().trim().min(1).max(SOURCE_NAME_MAX);

const SourceCodeSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(1)
	.max(SOURCE_CODE_MAX)
	.regex(SOURCE_CODE_PATTERN, 'Latin letters, digits, "-" and "_" only');

export const CreateSourceSchema = z
	.object({
		name: SourceNameSchema,
		code: SourceCodeSchema,
	})
	.openapi({ description: 'A new place customers learn about the company from, with its own link' });

export type CreateSourceData = z.infer<typeof CreateSourceSchema>;

export const UpdateSourceSchema = z
	.object({
		name: SourceNameSchema,
		isActive: z.boolean(),
	})
	.partial()
	.openapi({ description: 'Rename, archive or restore a source' });

export type UpdateSourceData = z.infer<typeof UpdateSourceSchema>;

export const UpdateBookingSourceSchema = z
	.object({
		sourceId: z.string().min(1).nullable(),
	})
	.openapi({ description: 'Where the customer learned about the company; null when unknown' });

export type UpdateBookingSourceData = z.infer<typeof UpdateBookingSourceSchema>;

export const RecordSourceVisitSchema = z
	.object({
		ref: z.string().max(200),
	})
	.openapi({ description: 'Someone opened the site by a link with this label for the first time' });

export type RecordSourceVisitData = z.infer<typeof RecordSourceVisitSchema>;

export function sourceConversion(totals: Pick<SourceTotals, 'visits' | 'siteBookings'>): number | null {
	if (totals.visits <= 0) return null;
	return Math.min(1, totals.siteBookings / totals.visits);
}
