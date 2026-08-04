import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DashboardSnapshotWhereUniqueInputSchema } from '../inputTypeSchemas/DashboardSnapshotWhereUniqueInputSchema'
import { DashboardSnapshotCreateInputSchema } from '../inputTypeSchemas/DashboardSnapshotCreateInputSchema'
import { DashboardSnapshotUncheckedCreateInputSchema } from '../inputTypeSchemas/DashboardSnapshotUncheckedCreateInputSchema'
import { DashboardSnapshotUpdateInputSchema } from '../inputTypeSchemas/DashboardSnapshotUpdateInputSchema'
import { DashboardSnapshotUncheckedUpdateInputSchema } from '../inputTypeSchemas/DashboardSnapshotUncheckedUpdateInputSchema'
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const DashboardSnapshotSelectSchema: z.ZodType<Prisma.DashboardSnapshotSelect> = z.object({
  date: z.boolean().optional(),
  totalEvents: z.boolean().optional(),
  totalUsers: z.boolean().optional(),
  publishedEvents: z.boolean().optional(),
  draftEvents: z.boolean().optional(),
  cancelledEvents: z.boolean().optional(),
  totalBookings: z.boolean().optional(),
  pendingBookings: z.boolean().optional(),
  confirmedBookings: z.boolean().optional(),
  cancelledBookings: z.boolean().optional(),
  expiredBookings: z.boolean().optional(),
  totalCapacity: z.boolean().optional(),
  usedCapacity: z.boolean().optional(),
  totalRevenue: z.boolean().optional(),
  createdAt: z.boolean().optional(),
}).strict()

export const DashboardSnapshotUpsertArgsSchema: z.ZodType<Prisma.DashboardSnapshotUpsertArgs> = z.object({
  select: DashboardSnapshotSelectSchema.optional(),
  where: DashboardSnapshotWhereUniqueInputSchema, 
  create: z.union([ DashboardSnapshotCreateInputSchema, DashboardSnapshotUncheckedCreateInputSchema ]),
  update: z.union([ DashboardSnapshotUpdateInputSchema, DashboardSnapshotUncheckedUpdateInputSchema ]),
}).strict();

export default DashboardSnapshotUpsertArgsSchema;
