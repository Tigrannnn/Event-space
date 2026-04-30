import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventUpdatewhatsIncludedInputSchema: z.ZodType<Prisma.EventUpdatewhatsIncludedInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export default EventUpdatewhatsIncludedInputSchema;
