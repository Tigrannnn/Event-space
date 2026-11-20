import { z } from 'zod';

export const AnalyticsEventTypeSchema = z.enum(['VISIT','TOUR_VIEW','BOOKING_STARTED']);

export type AnalyticsEventTypeType = `${z.infer<typeof AnalyticsEventTypeSchema>}`

export default AnalyticsEventTypeSchema;
