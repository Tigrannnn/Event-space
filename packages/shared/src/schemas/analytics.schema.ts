import { z } from './openapi';
import { AnalyticsEventTypeSchema } from '../generated/inputTypeSchemas/AnalyticsEventTypeSchema';

export const ANALYTICS_VISITOR_COOKIE = 'es_vid';
export const ANALYTICS_VISITOR_MAX_AGE_DAYS = 365;

export const AnalyticsEventTypeEnum = AnalyticsEventTypeSchema;
export type AnalyticsEventType = z.infer<typeof AnalyticsEventTypeEnum>;

export const TrackAnalyticsSchema = z
	.object({
		type: AnalyticsEventTypeEnum,
		visitorId: z.string().uuid(),
		eventId: z.string().uuid().optional(),
		ref: z.string().max(200).optional(),
	})
	.refine((data) => data.type === 'VISIT' || Boolean(data.eventId), {
		path: ['eventId'],
		message: 'A tour view or a booking start needs the tour',
	})
	.openapi({ description: 'A visitor opened the site, a tour page, or the booking form' });

export type TrackAnalyticsData = z.infer<typeof TrackAnalyticsSchema>;

export const TrafficPointSchema = z.object({
	date: z.string(),
	visitors: z.number().int(),
});

export type TrafficPoint = z.infer<typeof TrafficPointSchema>;

export const TrafficSourceRowSchema = z.object({
	sourceId: z.string().nullable(),
	ref: z.string().nullable(),
	name: z.string().nullable(),
	visitors: z.number().int(),
});

export type TrafficSourceRow = z.infer<typeof TrafficSourceRowSchema>;

export const TrafficReportSchema = z.object({
	visitors: z.number().int(),
	visits: z.number().int(),
	points: z.array(TrafficPointSchema),
	bySource: z.array(TrafficSourceRowSchema),
});

export type TrafficReport = z.infer<typeof TrafficReportSchema>;

export const TourFunnelRowSchema = z.object({
	eventId: z.string(),
	titles: z.array(z.object({ locale: z.string(), title: z.string() })),
	views: z.number().int(),
	favorites: z.number().int(),
	started: z.number().int(),
	booked: z.number().int(),
});

export type TourFunnelRow = z.infer<typeof TourFunnelRowSchema>;
