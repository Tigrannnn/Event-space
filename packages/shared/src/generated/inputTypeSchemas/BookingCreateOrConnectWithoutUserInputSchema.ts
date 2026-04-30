import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingCreateWithoutUserInputSchema } from './BookingCreateWithoutUserInputSchema';
import { BookingUncheckedCreateWithoutUserInputSchema } from './BookingUncheckedCreateWithoutUserInputSchema';

export const BookingCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema), z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default BookingCreateOrConnectWithoutUserInputSchema;
