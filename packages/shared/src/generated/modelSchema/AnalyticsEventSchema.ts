import { z } from 'zod';
import { AnalyticsEventTypeSchema } from '../inputTypeSchemas/AnalyticsEventTypeSchema'

/////////////////////////////////////////
// ANALYTICS EVENT SCHEMA
/////////////////////////////////////////

export const AnalyticsEventSchema = z.object({
  type: AnalyticsEventTypeSchema,
  id: z.uuid(),
  visitorId: z.string(),
  day: z.string(),
  targetKey: z.string(),
  eventId: z.string().nullable(),
  sourceRef: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>

export default AnalyticsEventSchema;
