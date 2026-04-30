import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventSelectSchema } from '../inputTypeSchemas/EventSelectSchema';
import { EventIncludeSchema } from '../inputTypeSchemas/EventIncludeSchema';

export const EventArgsSchema: z.ZodType<Prisma.EventDefaultArgs> = z.object({
  select: z.lazy(() => EventSelectSchema).optional(),
  include: z.lazy(() => EventIncludeSchema).optional(),
}).strict();

export default EventArgsSchema;
