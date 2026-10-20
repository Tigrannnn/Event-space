import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingCreateWithoutModificationsInputSchema } from './BookingCreateWithoutModificationsInputSchema';
import { BookingUncheckedCreateWithoutModificationsInputSchema } from './BookingUncheckedCreateWithoutModificationsInputSchema';

export const BookingCreateOrConnectWithoutModificationsInputSchema: z.ZodType<Prisma.BookingCreateOrConnectWithoutModificationsInput> = z.strictObject({
  where: z.lazy(() => BookingWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BookingCreateWithoutModificationsInputSchema), z.lazy(() => BookingUncheckedCreateWithoutModificationsInputSchema) ]),
});

export default BookingCreateOrConnectWithoutModificationsInputSchema;
