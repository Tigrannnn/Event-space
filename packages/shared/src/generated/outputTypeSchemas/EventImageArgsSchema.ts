import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventImageSelectSchema } from '../inputTypeSchemas/EventImageSelectSchema';
import { EventImageIncludeSchema } from '../inputTypeSchemas/EventImageIncludeSchema';

export const EventImageArgsSchema: z.ZodType<Prisma.EventImageDefaultArgs> = z.object({
  select: z.lazy(() => EventImageSelectSchema).optional(),
  include: z.lazy(() => EventImageIncludeSchema).optional(),
}).strict();

export default EventImageArgsSchema;
