import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DashboardSnapshotWhereInputSchema } from '../inputTypeSchemas/DashboardSnapshotWhereInputSchema'
import { DashboardSnapshotOrderByWithRelationInputSchema } from '../inputTypeSchemas/DashboardSnapshotOrderByWithRelationInputSchema'
import { DashboardSnapshotWhereUniqueInputSchema } from '../inputTypeSchemas/DashboardSnapshotWhereUniqueInputSchema'

export const DashboardSnapshotAggregateArgsSchema: z.ZodType<Prisma.DashboardSnapshotAggregateArgs> = z.object({
  where: DashboardSnapshotWhereInputSchema.optional(), 
  orderBy: z.union([ DashboardSnapshotOrderByWithRelationInputSchema.array(), DashboardSnapshotOrderByWithRelationInputSchema ]).optional(),
  cursor: DashboardSnapshotWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default DashboardSnapshotAggregateArgsSchema;
