import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DashboardSnapshotUpdateManyMutationInputSchema } from '../inputTypeSchemas/DashboardSnapshotUpdateManyMutationInputSchema'
import { DashboardSnapshotUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/DashboardSnapshotUncheckedUpdateManyInputSchema'
import { DashboardSnapshotWhereInputSchema } from '../inputTypeSchemas/DashboardSnapshotWhereInputSchema'

export const DashboardSnapshotUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.DashboardSnapshotUpdateManyAndReturnArgs> = z.object({
  data: z.union([ DashboardSnapshotUpdateManyMutationInputSchema, DashboardSnapshotUncheckedUpdateManyInputSchema ]),
  where: DashboardSnapshotWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default DashboardSnapshotUpdateManyAndReturnArgsSchema;
