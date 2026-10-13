import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DecimalNullableFilterSchema } from './DecimalNullableFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';

export const DashboardSnapshotWhereInputSchema: z.ZodType<Prisma.DashboardSnapshotWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => DashboardSnapshotWhereInputSchema), z.lazy(() => DashboardSnapshotWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DashboardSnapshotWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DashboardSnapshotWhereInputSchema), z.lazy(() => DashboardSnapshotWhereInputSchema).array() ]).optional(),
  date: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  totalEvents: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  totalUsers: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  publishedEvents: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  draftEvents: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  cancelledEvents: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  totalCapacity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  usedCapacity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  expectedRevenue: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export default DashboardSnapshotWhereInputSchema;
