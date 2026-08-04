import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DashboardSnapshotCreateManyInputSchema } from '../inputTypeSchemas/DashboardSnapshotCreateManyInputSchema'

export const DashboardSnapshotCreateManyArgsSchema: z.ZodType<Prisma.DashboardSnapshotCreateManyArgs> = z.object({
  data: z.union([ DashboardSnapshotCreateManyInputSchema, DashboardSnapshotCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default DashboardSnapshotCreateManyArgsSchema;
