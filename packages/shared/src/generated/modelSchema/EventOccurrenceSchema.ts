import { z } from 'zod';

/////////////////////////////////////////
// EVENT OCCURRENCE SCHEMA
/////////////////////////////////////////

export const EventOccurrenceSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string(),
  date: z.coerce.date(),
  maxParticipants: z.number().int(),
  currentParticipants: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type EventOccurrence = z.infer<typeof EventOccurrenceSchema>

export default EventOccurrenceSchema;
