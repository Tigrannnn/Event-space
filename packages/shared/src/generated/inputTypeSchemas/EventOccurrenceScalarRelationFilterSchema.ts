import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceWhereInputSchema } from './EventOccurrenceWhereInputSchema';

export const EventOccurrenceScalarRelationFilterSchema: z.ZodType<Prisma.EventOccurrenceScalarRelationFilter> = z.object({
  is: z.lazy(() => EventOccurrenceWhereInputSchema).optional(),
  isNot: z.lazy(() => EventOccurrenceWhereInputSchema).optional(),
}).strict();

export default EventOccurrenceScalarRelationFilterSchema;
