import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';

export const DashboardSnapshotOrderByWithRelationInputSchema: z.ZodType<Prisma.DashboardSnapshotOrderByWithRelationInput> = z.strictObject({
  date: z.lazy(() => SortOrderSchema).optional(),
  totalEvents: z.lazy(() => SortOrderSchema).optional(),
  totalUsers: z.lazy(() => SortOrderSchema).optional(),
  publishedEvents: z.lazy(() => SortOrderSchema).optional(),
  draftEvents: z.lazy(() => SortOrderSchema).optional(),
  cancelledEvents: z.lazy(() => SortOrderSchema).optional(),
  totalCapacity: z.lazy(() => SortOrderSchema).optional(),
  usedCapacity: z.lazy(() => SortOrderSchema).optional(),
  expectedRevenue: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export default DashboardSnapshotOrderByWithRelationInputSchema;
