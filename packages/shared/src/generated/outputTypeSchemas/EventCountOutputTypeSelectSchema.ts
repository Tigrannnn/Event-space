import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const EventCountOutputTypeSelectSchema: z.ZodType<Prisma.EventCountOutputTypeSelect> = z.object({
  occurrences: z.boolean().optional(),
  images: z.boolean().optional(),
  favorites: z.boolean().optional(),
  cancellationRules: z.boolean().optional(),
  translations: z.boolean().optional(),
}).strict();

export default EventCountOutputTypeSelectSchema;
