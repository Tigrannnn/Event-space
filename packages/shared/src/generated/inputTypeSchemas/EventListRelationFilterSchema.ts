import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventListRelationFilterSchema: z.ZodType<Prisma.EventListRelationFilter> = z.strictObject({
  every: z.lazy(() => EventWhereInputSchema).optional(),
  some: z.lazy(() => EventWhereInputSchema).optional(),
  none: z.lazy(() => EventWhereInputSchema).optional(),
});

export default EventListRelationFilterSchema;
