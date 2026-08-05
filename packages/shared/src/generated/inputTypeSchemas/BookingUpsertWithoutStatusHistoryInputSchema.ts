import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingUpdateWithoutStatusHistoryInputSchema } from './BookingUpdateWithoutStatusHistoryInputSchema';
import { BookingUncheckedUpdateWithoutStatusHistoryInputSchema } from './BookingUncheckedUpdateWithoutStatusHistoryInputSchema';
import { BookingCreateWithoutStatusHistoryInputSchema } from './BookingCreateWithoutStatusHistoryInputSchema';
import { BookingUncheckedCreateWithoutStatusHistoryInputSchema } from './BookingUncheckedCreateWithoutStatusHistoryInputSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingUpsertWithoutStatusHistoryInputSchema: z.ZodType<Prisma.BookingUpsertWithoutStatusHistoryInput> = z.strictObject({
  update: z.union([ z.lazy(() => BookingUpdateWithoutStatusHistoryInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutStatusHistoryInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutStatusHistoryInputSchema), z.lazy(() => BookingUncheckedCreateWithoutStatusHistoryInputSchema) ]),
  where: z.lazy(() => BookingWhereInputSchema).optional(),
});

export default BookingUpsertWithoutStatusHistoryInputSchema;
