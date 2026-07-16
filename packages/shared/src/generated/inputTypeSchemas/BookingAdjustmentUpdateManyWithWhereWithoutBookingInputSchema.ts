import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingAdjustmentScalarWhereInputSchema } from './BookingAdjustmentScalarWhereInputSchema';
import { BookingAdjustmentUpdateManyMutationInputSchema } from './BookingAdjustmentUpdateManyMutationInputSchema';
import { BookingAdjustmentUncheckedUpdateManyWithoutBookingInputSchema } from './BookingAdjustmentUncheckedUpdateManyWithoutBookingInputSchema';

export const BookingAdjustmentUpdateManyWithWhereWithoutBookingInputSchema: z.ZodType<Prisma.BookingAdjustmentUpdateManyWithWhereWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingAdjustmentScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingAdjustmentUpdateManyMutationInputSchema), z.lazy(() => BookingAdjustmentUncheckedUpdateManyWithoutBookingInputSchema) ]),
});

export default BookingAdjustmentUpdateManyWithWhereWithoutBookingInputSchema;
