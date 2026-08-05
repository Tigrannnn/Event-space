import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DashboardSnapshotWhereInputSchema } from '../inputTypeSchemas/DashboardSnapshotWhereInputSchema'
import { DashboardSnapshotOrderByWithRelationInputSchema } from '../inputTypeSchemas/DashboardSnapshotOrderByWithRelationInputSchema'
import { DashboardSnapshotWhereUniqueInputSchema } from '../inputTypeSchemas/DashboardSnapshotWhereUniqueInputSchema'
import { DashboardSnapshotScalarFieldEnumSchema } from '../inputTypeSchemas/DashboardSnapshotScalarFieldEnumSchema'
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

export const DashboardSnapshotFindFirstOrThrowArgsSchema: z.ZodType<Prisma.DashboardSnapshotFindFirstOrThrowArgs> = z.object({
  select: DashboardSnapshotSelectSchema.optional(),
  where: DashboardSnapshotWhereInputSchema.optional(), 
  orderBy: z.union([ DashboardSnapshotOrderByWithRelationInputSchema.array(), DashboardSnapshotOrderByWithRelationInputSchema ]).optional(),
  cursor: DashboardSnapshotWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ DashboardSnapshotScalarFieldEnumSchema, DashboardSnapshotScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export default DashboardSnapshotFindFirstOrThrowArgsSchema;
