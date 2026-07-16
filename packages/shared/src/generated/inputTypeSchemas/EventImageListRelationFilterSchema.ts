import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageWhereInputSchema } from './EventImageWhereInputSchema';

export const EventImageListRelationFilterSchema: z.ZodType<Prisma.EventImageListRelationFilter> = z.strictObject({
  every: z.lazy(() => EventImageWhereInputSchema).optional(),
  some: z.lazy(() => EventImageWhereInputSchema).optional(),
  none: z.lazy(() => EventImageWhereInputSchema).optional(),
});

export default EventImageListRelationFilterSchema;
