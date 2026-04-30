import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateWithoutUserInputSchema } from './BookingUpdateWithoutUserInputSchema';
import { BookingUncheckedUpdateWithoutUserInputSchema } from './BookingUncheckedUpdateWithoutUserInputSchema';
import { BookingCreateWithoutUserInputSchema } from './BookingCreateWithoutUserInputSchema';
import { BookingUncheckedCreateWithoutUserInputSchema } from './BookingUncheckedCreateWithoutUserInputSchema';

export const BookingUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.BookingUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => BookingUpdateWithoutUserInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema), z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default BookingUpsertWithWhereUniqueWithoutUserInputSchema;
