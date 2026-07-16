import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingCreateWithoutAdjustmentsInputSchema } from './BookingCreateWithoutAdjustmentsInputSchema';
import { BookingUncheckedCreateWithoutAdjustmentsInputSchema } from './BookingUncheckedCreateWithoutAdjustmentsInputSchema';

export const BookingCreateOrConnectWithoutAdjustmentsInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutAdjustmentsInput> = z.strictObject({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutAdjustmentsInputSchema), z.lazy(() => BookingUncheckedCreateWithoutAdjustmentsInputSchema) ]),
});

export default BookingCreateOrConnectWithoutAdjustmentsInputSchema;
