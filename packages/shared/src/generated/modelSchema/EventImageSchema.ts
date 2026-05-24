import { z } from 'zod';

/////////////////////////////////////////
// EVENT IMAGE SCHEMA
/////////////////////////////////////////

export const EventImageSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string(),
  url: z.string(),
  publicId: z.string(),
  order: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type EventImage = z.infer<typeof EventImageSchema>

export default EventImageSchema;
