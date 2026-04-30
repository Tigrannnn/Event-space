import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithoutEventInputSchema } from './BookingUpdateWithoutEventInputSchema';
import { BookingUncheckedUpdateWithoutEventInputSchema } from './BookingUncheckedUpdateWithoutEventInputSchema';
import { BookingCreateWithoutEventInputSchema } from './BookingCreateWithoutEventInputSchema';
import { BookingUncheckedCreateWithoutEventInputSchema } from './BookingUncheckedCreateWithoutEventInputSchema';

export const BookingUpsertWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.BookingUpsertWithWhereUniqueWithoutEventInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingUpdateWithoutEventInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutEventInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutEventInputSchema), z.lazy(() => BookingUncheckedCreateWithoutEventInputSchema) ]),
}).strict();

export default BookingUpsertWithWhereUniqueWithoutEventInputSchema;
