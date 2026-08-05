import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingCreateWithoutStatusHistoryInputSchema } from './BookingCreateWithoutStatusHistoryInputSchema';
import { BookingUncheckedCreateWithoutStatusHistoryInputSchema } from './BookingUncheckedCreateWithoutStatusHistoryInputSchema';

export const BookingCreateOrConnectWithoutStatusHistoryInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutStatusHistoryInput> = z.strictObject({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutStatusHistoryInputSchema), z.lazy(() => BookingUncheckedCreateWithoutStatusHistoryInputSchema) ]),
});

export default BookingCreateOrConnectWithoutStatusHistoryInputSchema;
