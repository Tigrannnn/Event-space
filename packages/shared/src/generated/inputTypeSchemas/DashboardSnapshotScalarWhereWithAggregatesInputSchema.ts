import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { DecimalNullableWithAggregatesFilterSchema } from './DecimalNullableWithAggregatesFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';

export const DashboardSnapshotScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.DashboardSnapshotScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => DashboardSnapshotScalarWhereWithAggregatesInputSchema), z.lazy(() => DashboardSnapshotScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => DashboardSnapshotScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DashboardSnapshotScalarWhereWithAggregatesInputSchema), z.lazy(() => DashboardSnapshotScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  totalEvents: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  totalUsers: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  publishedEvents: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  draftEvents: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  cancelledEvents: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  totalCapacity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  usedCapacity: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  expectedRevenue: z.union([ z.lazy(() => DecimalNullableWithAggregatesFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export default DashboardSnapshotScalarWhereWithAggregatesInputSchema;
