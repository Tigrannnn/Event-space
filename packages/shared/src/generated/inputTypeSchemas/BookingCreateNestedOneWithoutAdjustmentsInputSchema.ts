import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutAdjustmentsInputSchema } from './BookingCreateWithoutAdjustmentsInputSchema';
import { BookingUncheckedCreateWithoutAdjustmentsInputSchema } from './BookingUncheckedCreateWithoutAdjustmentsInputSchema';
import { BookingCreateOrConnectWithoutAdjustmentsInputSchema } from './BookingCreateOrConnectWithoutAdjustmentsInputSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';

export const BookingCreateNestedOneWithoutAdjustmentsInputSchema: z.ZodType<Prisma.BookingCreateNestedOneWithoutAdjustmentsInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingCreateWithoutAdjustmentsInputSchema), z.lazy(() => BookingUncheckedCreateWithoutAdjustmentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutAdjustmentsInputSchema).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional(),
});

export default BookingCreateNestedOneWithoutAdjustmentsInputSchema;
