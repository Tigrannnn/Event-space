import { z } from 'zod';

export const EventStatusSchema = z.enum(['DRAFT','PUBLISHED','CANCELLED']);

export type EventStatusType = `${z.infer<typeof EventStatusSchema>}`

export default EventStatusSchema;
