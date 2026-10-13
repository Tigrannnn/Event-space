import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { NullableDecimalFieldUpdateOperationsInputSchema } from './NullableDecimalFieldUpdateOperationsInputSchema';

export const DashboardSnapshotUncheckedUpdateInputSchema: z.ZodType<Prisma.DashboardSnapshotUncheckedUpdateInput> = z.strictObject({
  date: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  totalEvents: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalUsers: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  publishedEvents: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  draftEvents: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  cancelledEvents: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  totalCapacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  usedCapacity: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  expectedRevenue: z.union([ z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),z.lazy(() => NullableDecimalFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export default DashboardSnapshotUncheckedUpdateInputSchema;
