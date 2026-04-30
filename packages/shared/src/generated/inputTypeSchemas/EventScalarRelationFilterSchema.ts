import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventScalarRelationFilterSchema: z.ZodType<Prisma.EventScalarRelationFilter> = z.object({
  is: z.lazy(() => EventWhereInputSchema).optional(),
  isNot: z.lazy(() => EventWhereInputSchema).optional(),
}).strict();

export default EventScalarRelationFilterSchema;
