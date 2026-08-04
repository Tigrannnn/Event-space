import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DashboardSnapshotWhereInputSchema } from '../inputTypeSchemas/DashboardSnapshotWhereInputSchema'

export const DashboardSnapshotDeleteManyArgsSchema: z.ZodType<Prisma.DashboardSnapshotDeleteManyArgs> = z.object({
  where: DashboardSnapshotWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default DashboardSnapshotDeleteManyArgsSchema;
