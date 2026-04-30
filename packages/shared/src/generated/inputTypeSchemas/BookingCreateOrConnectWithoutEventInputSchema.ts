import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingCreateWithoutEventInputSchema } from './BookingCreateWithoutEventInputSchema';
import { BookingUncheckedCreateWithoutEventInputSchema } from './BookingUncheckedCreateWithoutEventInputSchema';

export const BookingCreateOrConnectWithoutEventInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutEventInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutEventInputSchema), z.lazy(() => BookingUncheckedCreateWithoutEventInputSchema) ]),
}).strict();

export default BookingCreateOrConnectWithoutEventInputSchema;
