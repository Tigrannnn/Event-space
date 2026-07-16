import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingUpdateWithoutAdjustmentsInputSchema } from './BookingUpdateWithoutAdjustmentsInputSchema';
import { BookingUncheckedUpdateWithoutAdjustmentsInputSchema } from './BookingUncheckedUpdateWithoutAdjustmentsInputSchema';
import { BookingCreateWithoutAdjustmentsInputSchema } from './BookingCreateWithoutAdjustmentsInputSchema';
import { BookingUncheckedCreateWithoutAdjustmentsInputSchema } from './BookingUncheckedCreateWithoutAdjustmentsInputSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingUpsertWithoutAdjustmentsInputSchema: z.ZodType<Prisma.BookingUpsertWithoutAdjustmentsInput> = z.strictObject({
  update: z.union([ z.lazy(() => BookingUpdateWithoutAdjustmentsInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutAdjustmentsInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutAdjustmentsInputSchema), z.lazy(() => BookingUncheckedCreateWithoutAdjustmentsInputSchema) ]),
  where: z.lazy(() => BookingWhereInputSchema).optional(),
});

export default BookingUpsertWithoutAdjustmentsInputSchema;
