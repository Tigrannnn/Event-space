import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageWhereInputSchema } from './EventImageWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';

export const EventImageWhereUniqueInputSchema: z.ZodType<Prisma.EventImageWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    publicId: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    publicId: z.string(),
  }),
])
.and(z.object({
  id: z.uuid().optional(),
  publicId: z.string().optional(),
  AND: z.union([ z.lazy(() => EventImageWhereInputSchema), z.lazy(() => EventImageWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventImageWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventImageWhereInputSchema), z.lazy(() => EventImageWhereInputSchema).array() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  order: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
}).strict());

export default EventImageWhereUniqueInputSchema;
