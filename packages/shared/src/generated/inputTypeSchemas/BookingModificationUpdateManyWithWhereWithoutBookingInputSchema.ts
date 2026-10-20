import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingModificationScalarWhereInputSchema } from './BookingModificationScalarWhereInputSchema';
import { BookingModificationUpdateManyMutationInputSchema } from './BookingModificationUpdateManyMutationInputSchema';
import { BookingModificationUncheckedUpdateManyWithoutBookingInputSchema } from './BookingModificationUncheckedUpdateManyWithoutBookingInputSchema';

export const BookingModificationUpdateManyWithWhereWithoutBookingInputSchema: z.ZodType<Prisma.BookingModificationUpdateManyWithWhereWithoutBookingInput> = z.strictObject({
  where: z.lazy(() => BookingModificationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingModificationUpdateManyMutationInputSchema), z.lazy(() => BookingModificationUncheckedUpdateManyWithoutBookingInputSchema) ]),
});

export default BookingModificationUpdateManyWithWhereWithoutBookingInputSchema;
