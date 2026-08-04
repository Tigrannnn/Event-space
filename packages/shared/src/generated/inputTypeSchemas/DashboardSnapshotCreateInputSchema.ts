import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';

export const DashboardSnapshotCreateInputSchema: z.ZodType<Prisma.DashboardSnapshotCreateInput> = z.strictObject({
  date: z.coerce.date(),
  totalEvents: z.number().int(),
  totalUsers: z.number().int(),
  publishedEvents: z.number().int(),
  draftEvents: z.number().int(),
  cancelledEvents: z.number().int(),
  totalBookings: z.number().int(),
  pendingBookings: z.number().int(),
  confirmedBookings: z.number().int(),
  cancelledBookings: z.number().int(),
  expiredBookings: z.number().int(),
  totalCapacity: z.number().int(),
  usedCapacity: z.number().int(),
  totalRevenue: z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  createdAt: z.coerce.date().optional(),
});

export default DashboardSnapshotCreateInputSchema;
