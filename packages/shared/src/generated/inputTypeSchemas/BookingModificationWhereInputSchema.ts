import { Prisma } from '@prisma/client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumModificationStatusFilterSchema } from './EnumModificationStatusFilterSchema';
import { ModificationStatusSchema } from './ModificationStatusSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { BookingScalarRelationFilterSchema } from './BookingScalarRelationFilterSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingModificationWhereInputSchema: z.ZodType<Prisma.BookingModificationWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => BookingModificationWhereInputSchema), z.lazy(() => BookingModificationWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BookingModificationWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BookingModificationWhereInputSchema), z.lazy(() => BookingModificationWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  bookingId: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  fromQuantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  toQuantity: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  amount: z.union([ z.lazy(() => DecimalFilterSchema), z.union([z.number(),z.string(),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  paymentIntentId: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumModificationStatusFilterSchema), z.lazy(() => ModificationStatusSchema) ]).optional(),
  failureReason: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  appliedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  booking: z.union([ z.lazy(() => BookingScalarRelationFilterSchema), z.lazy(() => BookingWhereInputSchema) ]).optional(),
});

export default BookingModificationWhereInputSchema;
