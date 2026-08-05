import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';

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
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export default DashboardSnapshotWhereInputSchema;
