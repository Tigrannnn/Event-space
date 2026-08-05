import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutStatusHistoryInputSchema } from './BookingCreateWithoutStatusHistoryInputSchema';
import { BookingUncheckedCreateWithoutStatusHistoryInputSchema } from './BookingUncheckedCreateWithoutStatusHistoryInputSchema';
import { BookingCreateOrConnectWithoutStatusHistoryInputSchema } from './BookingCreateOrConnectWithoutStatusHistoryInputSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';

export const BookingCreateNestedOneWithoutStatusHistoryInputSchema: z.ZodType<Prisma.BookingCreateNestedOneWithoutStatusHistoryInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingCreateWithoutStatusHistoryInputSchema), z.lazy(() => BookingUncheckedCreateWithoutStatusHistoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutStatusHistoryInputSchema).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional(),
});

export default BookingCreateNestedOneWithoutStatusHistoryInputSchema;
