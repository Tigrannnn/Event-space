import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventCreateimagesInputSchema: z.ZodType<Prisma.EventCreateimagesInput> = z.object({
  set: z.string().array(),
}).strict();

export default EventCreateimagesInputSchema;
