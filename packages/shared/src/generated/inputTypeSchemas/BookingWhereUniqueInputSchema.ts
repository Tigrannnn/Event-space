import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingUserIdEventIdCompoundUniqueInputSchema } from './BookingUserIdEventIdCompoundUniqueInputSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumBookingStatusFilterSchema } from './EnumBookingStatusFilterSchema';
import { BookingStatusSchema } from './BookingStatusSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DecimalNullableFilterSchema } from './DecimalNullableFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { EventScalarRelationFilterSchema } from './EventScalarRelationFilterSchema';
import { EventWhereInputSchema } from './EventWhereInputSchema';
import { BookingAdjustmentListRelationFilterSchema } from './BookingAdjustmentListRelationFilterSchema';

export const BookingWhereUniqueInputSchema: z.ZodType<Prisma.BookingWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    paymentIntentId: z.string(),
    userId_eventId: z.lazy(() => BookingUserIdEventIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
    paymentIntentId: z.string(),
  }),
  z.object({
    id: z.uuid(),
    userId_eventId: z.lazy(() => BookingUserIdEventIdCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    paymentIntentId: z.string(),
    userId_eventId: z.lazy(() => BookingUserIdEventIdCompoundUniqueInputSchema),
  }),
  z.object({
    paymentIntentId: z.string(),
  }),
  z.object({
    userId_eventId: z.lazy(() => BookingUserIdEventIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.uuid().optional(),
  paymentIntentId: z.string().optional(),
  userId_eventId: z.lazy(() => BookingUserIdEventIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => BookingWhereInputSchema), z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingWhereInputSchema), z.lazy(() => BookingWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  eventId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  status: z.union([ z.lazy(() => EnumBookingStatusFilterSchema), z.lazy(() => BookingStatusSchema) ]).optional(),
  quantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalNullableFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema) ]).optional(),
  event: z.union([ z.lazy(() => EventScalarRelationFilterSchema), z.lazy(() => EventWhereInputSchema) ]).optional(),
  adjustments: z.lazy(() => BookingAdjustmentListRelationFilterSchema).optional(),
}).strict());

export default BookingWhereUniqueInputSchema;
