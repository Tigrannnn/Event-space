import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';

export const DashboardSnapshotCreateManyInputSchema: z.ZodType<Prisma.DashboardSnapshotCreateManyInput> = z.strictObject({
  date: z.coerce.date(),
  totalEvents: z.number().int(),
  totalUsers: z.number().int(),
  publishedEvents: z.number().int(),
  draftEvents: z.number().int(),
  cancelledEvents: z.number().int(),
  totalCapacity: z.number().int(),
  usedCapacity: z.number().int(),
  expectedRevenue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  createdAt: z.coerce.date().optional(),
});

export default DashboardSnapshotCreateManyInputSchema;
