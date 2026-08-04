import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { DashboardSnapshotWhereInputSchema } from './DashboardSnapshotWhereInputSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const DashboardSnapshotWhereUniqueInputSchema: z.ZodType<Prisma.DashboardSnapshotWhereUniqueInput> = z.object({
  date: z.coerce.date(),
})
.and(z.strictObject({
  date: z.coerce.date().optional(),
  AND: z.union([ z.lazy(() => DashboardSnapshotWhereInputSchema), z.lazy(() => DashboardSnapshotWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => DashboardSnapshotWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => DashboardSnapshotWhereInputSchema), z.lazy(() => DashboardSnapshotWhereInputSchema).array() ]).optional(),
  totalEvents: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  totalUsers: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  publishedEvents: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  draftEvents: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  cancelledEvents: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  totalBookings: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  pendingBookings: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  confirmedBookings: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  cancelledBookings: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  expiredBookings: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  totalCapacity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  usedCapacity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  totalRevenue: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
}));

export default DashboardSnapshotWhereUniqueInputSchema;
