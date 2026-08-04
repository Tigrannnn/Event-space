import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const DashboardSnapshotMinOrderByAggregateInputSchema: z.ZodType<Prisma.DashboardSnapshotMinOrderByAggregateInput> = z.strictObject({
  date: z.lazy(() => SortOrderSchema).optional(),
  totalEvents: z.lazy(() => SortOrderSchema).optional(),
  totalUsers: z.lazy(() => SortOrderSchema).optional(),
  publishedEvents: z.lazy(() => SortOrderSchema).optional(),
  draftEvents: z.lazy(() => SortOrderSchema).optional(),
  cancelledEvents: z.lazy(() => SortOrderSchema).optional(),
  totalBookings: z.lazy(() => SortOrderSchema).optional(),
  pendingBookings: z.lazy(() => SortOrderSchema).optional(),
  confirmedBookings: z.lazy(() => SortOrderSchema).optional(),
  cancelledBookings: z.lazy(() => SortOrderSchema).optional(),
  expiredBookings: z.lazy(() => SortOrderSchema).optional(),
  totalCapacity: z.lazy(() => SortOrderSchema).optional(),
  usedCapacity: z.lazy(() => SortOrderSchema).optional(),
  totalRevenue: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
});

export default DashboardSnapshotMinOrderByAggregateInputSchema;
