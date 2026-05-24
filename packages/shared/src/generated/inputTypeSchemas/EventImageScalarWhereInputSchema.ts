import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const EventImageScalarWhereInputSchema: z.ZodType<Prisma.EventImageScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => EventImageScalarWhereInputSchema), z.lazy(() => EventImageScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => EventImageScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => EventImageScalarWhereInputSchema), z.lazy(() => EventImageScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  url: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  publicId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  order: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
}).strict();

export default EventImageScalarWhereInputSchema;
