import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DashboardSnapshotCreateInputSchema } from '../inputTypeSchemas/DashboardSnapshotCreateInputSchema'
import { DashboardSnapshotUncheckedCreateInputSchema } from '../inputTypeSchemas/DashboardSnapshotUncheckedCreateInputSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

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

export const DashboardSnapshotCreateArgsSchema: z.ZodType<Prisma.DashboardSnapshotCreateArgs> = z.object({
  select: DashboardSnapshotSelectSchema.optional(),
  data: z.union([ DashboardSnapshotCreateInputSchema, DashboardSnapshotUncheckedCreateInputSchema ]),
}).strict();

export default DashboardSnapshotCreateArgsSchema;
