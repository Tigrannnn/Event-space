import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DashboardSnapshotWhereInputSchema } from '../inputTypeSchemas/DashboardSnapshotWhereInputSchema'
import { DashboardSnapshotOrderByWithAggregationInputSchema } from '../inputTypeSchemas/DashboardSnapshotOrderByWithAggregationInputSchema'
import { DashboardSnapshotScalarFieldEnumSchema } from '../inputTypeSchemas/DashboardSnapshotScalarFieldEnumSchema'
import { DashboardSnapshotScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/DashboardSnapshotScalarWhereWithAggregatesInputSchema'

export const DashboardSnapshotGroupByArgsSchema: z.ZodType<Prisma.DashboardSnapshotGroupByArgs> = z.object({
  where: DashboardSnapshotWhereInputSchema.optional(), 
  orderBy: z.union([ DashboardSnapshotOrderByWithAggregationInputSchema.array(), DashboardSnapshotOrderByWithAggregationInputSchema ]).optional(),
  by: DashboardSnapshotScalarFieldEnumSchema.array(), 
  having: DashboardSnapshotScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default DashboardSnapshotGroupByArgsSchema;
