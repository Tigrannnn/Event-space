import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { DashboardSnapshotCountOrderByAggregateInputSchema } from './DashboardSnapshotCountOrderByAggregateInputSchema';
import { DashboardSnapshotAvgOrderByAggregateInputSchema } from './DashboardSnapshotAvgOrderByAggregateInputSchema';
import { DashboardSnapshotMaxOrderByAggregateInputSchema } from './DashboardSnapshotMaxOrderByAggregateInputSchema';
import { DashboardSnapshotMinOrderByAggregateInputSchema } from './DashboardSnapshotMinOrderByAggregateInputSchema';
import { DashboardSnapshotSumOrderByAggregateInputSchema } from './DashboardSnapshotSumOrderByAggregateInputSchema';

export const DashboardSnapshotOrderByWithAggregationInputSchema: z.ZodType<Prisma.DashboardSnapshotOrderByWithAggregationInput> = z.strictObject({
  date: z.lazy(() => SortOrderSchema).optional(),
  totalEvents: z.lazy(() => SortOrderSchema).optional(),
  totalUsers: z.lazy(() => SortOrderSchema).optional(),
  publishedEvents: z.lazy(() => SortOrderSchema).optional(),
  draftEvents: z.lazy(() => SortOrderSchema).optional(),
  cancelledEvents: z.lazy(() => SortOrderSchema).optional(),
  totalCapacity: z.lazy(() => SortOrderSchema).optional(),
  usedCapacity: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => DashboardSnapshotCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => DashboardSnapshotAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => DashboardSnapshotMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => DashboardSnapshotMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => DashboardSnapshotSumOrderByAggregateInputSchema).optional(),
});

export default DashboardSnapshotOrderByWithAggregationInputSchema;
