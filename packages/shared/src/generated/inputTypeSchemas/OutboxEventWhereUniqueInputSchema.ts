import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { OutboxEventWhereInputSchema } from './OutboxEventWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { EnumOutboxStatusFilterSchema } from './EnumOutboxStatusFilterSchema';
import { OutboxStatusSchema } from './OutboxStatusSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const OutboxEventWhereUniqueInputSchema: z.ZodType<Prisma.OutboxEventWhereUniqueInput> = z.object({
  id: z.cuid(),
})
.and(z.object({
  id: z.cuid().optional(),
  AND: z.union([ z.lazy(() => OutboxEventWhereInputSchema), z.lazy(() => OutboxEventWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => OutboxEventWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OutboxEventWhereInputSchema), z.lazy(() => OutboxEventWhereInputSchema).array() ]).optional(),
  action: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  payload: z.lazy(() => JsonFilterSchema).optional(),
  status: z.union([ z.lazy(() => EnumOutboxStatusFilterSchema), z.lazy(() => OutboxStatusSchema) ]).optional(),
  attempts: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  lastError: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  processedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
}).strict());

export default OutboxEventWhereUniqueInputSchema;
