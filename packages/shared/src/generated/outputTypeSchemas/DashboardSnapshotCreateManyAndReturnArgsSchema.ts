import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { DashboardSnapshotCreateManyInputSchema } from '../inputTypeSchemas/DashboardSnapshotCreateManyInputSchema'

export const DashboardSnapshotCreateManyAndReturnArgsSchema: z.ZodType<Prisma.DashboardSnapshotCreateManyAndReturnArgs> = z.object({
  data: z.union([ DashboardSnapshotCreateManyInputSchema, DashboardSnapshotCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default DashboardSnapshotCreateManyAndReturnArgsSchema;
