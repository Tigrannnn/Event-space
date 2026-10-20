import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingModificationWhereInputSchema } from './BookingModificationWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { EnumModificationStatusFilterSchema } from './EnumModificationStatusFilterSchema';
import { ModificationStatusSchema } from './ModificationStatusSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { BookingScalarRelationFilterSchema } from './BookingScalarRelationFilterSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingModificationWhereUniqueInputSchema: z.ZodType<Prisma.BookingModificationWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    paymentIntentId: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    paymentIntentId: z.string(),
  }),
])
.and(z.strictObject({
  id: z.uuid().optional(),
  paymentIntentId: z.string().optional(),
  AND: z.union([ z.lazy(() => BookingModificationWhereInputSchema), z.lazy(() => BookingModificationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingModificationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingModificationWhereInputSchema), z.lazy(() => BookingModificationWhereInputSchema).array() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  fromQuantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  toQuantity: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  status: z.union([ z.lazy(() => EnumModificationStatusFilterSchema), z.lazy(() => ModificationStatusSchema) ]).optional(),
  failureReason: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  appliedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  booking: z.union([ z.lazy(() => BookingScalarRelationFilterSchema), z.lazy(() => BookingWhereInputSchema) ]).optional(),
}));

export default BookingModificationWhereUniqueInputSchema;
