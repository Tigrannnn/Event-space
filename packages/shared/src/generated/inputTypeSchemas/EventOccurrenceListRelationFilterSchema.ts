import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventOccurrenceWhereInputSchema } from './EventOccurrenceWhereInputSchema';

export const EventOccurrenceListRelationFilterSchema: z.ZodType<Prisma.EventOccurrenceListRelationFilter> = z.strictObject({
  every: z.lazy(() => EventOccurrenceWhereInputSchema).optional(),
  some: z.lazy(() => EventOccurrenceWhereInputSchema).optional(),
  none: z.lazy(() => EventOccurrenceWhereInputSchema).optional(),
});

export default EventOccurrenceListRelationFilterSchema;
