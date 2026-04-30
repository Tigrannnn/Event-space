import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventCountOutputTypeSelectSchema } from './EventCountOutputTypeSelectSchema';

export const EventCountOutputTypeArgsSchema: z.ZodType<Prisma.EventCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => EventCountOutputTypeSelectSchema).nullish(),
}).strict();

export default EventCountOutputTypeSelectSchema;
