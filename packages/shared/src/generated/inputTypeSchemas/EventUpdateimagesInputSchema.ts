import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventUpdateimagesInputSchema: z.ZodType<Prisma.EventUpdateimagesInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export default EventUpdateimagesInputSchema;
