import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventCreatewhatsIncludedInputSchema: z.ZodType<Prisma.EventCreatewhatsIncludedInput> = z.object({
  set: z.string().array(),
}).strict();

export default EventCreatewhatsIncludedInputSchema;
