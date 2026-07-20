import { z } from 'zod';

export const EventOccurrenceStatusSchema = z.enum(['ACTIVE','CANCELLED']);

export type EventOccurrenceStatusType = `${z.infer<typeof EventOccurrenceStatusSchema>}`

export default EventOccurrenceStatusSchema;
