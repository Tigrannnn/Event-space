import { z } from 'zod';
import type { Prisma } from '@prisma/client';

export const DashboardSnapshotSelectSchema: z.ZodType<Prisma.DashboardSnapshotSelect> = z.object({
  date: z.boolean().optional(),
  totalEvents: z.boolean().optional(),
  totalUsers: z.boolean().optional(),
  publishedEvents: z.boolean().optional(),
  draftEvents: z.boolean().optional(),
  cancelledEvents: z.boolean().optional(),
  totalCapacity: z.boolean().optional(),
  usedCapacity: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()

export default DashboardSnapshotSelectSchema;
