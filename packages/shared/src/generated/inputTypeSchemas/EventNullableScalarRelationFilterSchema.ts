import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventNullableScalarRelationFilterSchema: z.ZodType<Prisma.EventNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => EventWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => EventWhereInputSchema).optional().nullable(),
});

export default EventNullableScalarRelationFilterSchema;
