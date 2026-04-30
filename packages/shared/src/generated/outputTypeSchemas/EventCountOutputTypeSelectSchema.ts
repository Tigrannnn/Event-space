import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const EventCountOutputTypeSelectSchema: z.ZodType<Prisma.EventCountOutputTypeSelect> = z.object({
  bookings: z.boolean().optional(),
}).strict();

export default EventCountOutputTypeSelectSchema;
