import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const DashboardSnapshotUncheckedCreateInputSchema: z.ZodType<Prisma.DashboardSnapshotUncheckedCreateInput> = z.strictObject({
  date: z.coerce.date(),
  totalEvents: z.number().int(),
  totalUsers: z.number().int(),
  publishedEvents: z.number().int(),
  draftEvents: z.number().int(),
  cancelledEvents: z.number().int(),
  totalCapacity: z.number().int(),
  usedCapacity: z.number().int(),
  createdAt: z.coerce.date().optional(),
});

export default DashboardSnapshotUncheckedCreateInputSchema;
