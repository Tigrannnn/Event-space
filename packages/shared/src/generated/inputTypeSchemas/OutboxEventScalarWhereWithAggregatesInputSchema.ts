import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { EnumOutboxStatusWithAggregatesFilterSchema } from './EnumOutboxStatusWithAggregatesFilterSchema';
import { OutboxStatusSchema } from './OutboxStatusSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';

export const OutboxEventScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OutboxEventScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => OutboxEventScalarWhereWithAggregatesInputSchema), z.lazy(() => OutboxEventScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => OutboxEventScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => OutboxEventScalarWhereWithAggregatesInputSchema), z.lazy(() => OutboxEventScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  action: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  payload: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
  status: z.union([ z.lazy(() => EnumOutboxStatusWithAggregatesFilterSchema), z.lazy(() => OutboxStatusSchema) ]).optional(),
  attempts: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  lastError: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  processedAt: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
}).strict();

export default OutboxEventScalarWhereWithAggregatesInputSchema;
