import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const EventOccurrenceCountOutputTypeSelectSchema: z.ZodType<Prisma.EventOccurrenceCountOutputTypeSelect> = z.object({
  bookings: z.boolean().optional(),
}).strict();

export default EventOccurrenceCountOutputTypeSelectSchema;
