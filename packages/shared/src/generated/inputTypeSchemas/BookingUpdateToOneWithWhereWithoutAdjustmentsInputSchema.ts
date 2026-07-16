import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';
import { BookingUpdateWithoutAdjustmentsInputSchema } from './BookingUpdateWithoutAdjustmentsInputSchema';
import { BookingUncheckedUpdateWithoutAdjustmentsInputSchema } from './BookingUncheckedUpdateWithoutAdjustmentsInputSchema';

export const BookingUpdateToOneWithWhereWithoutAdjustmentsInputSchema: z.ZodType<Prisma.BookingUpdateToOneWithWhereWithoutAdjustmentsInput> = z.strictObject({
  where: z.lazy(() => BookingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => BookingUpdateWithoutAdjustmentsInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutAdjustmentsInputSchema) ]),
});

export default BookingUpdateToOneWithWhereWithoutAdjustmentsInputSchema;
