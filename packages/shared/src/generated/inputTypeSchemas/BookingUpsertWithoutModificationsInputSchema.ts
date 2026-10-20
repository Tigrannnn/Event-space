import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingUpdateWithoutModificationsInputSchema } from './BookingUpdateWithoutModificationsInputSchema';
import { BookingUncheckedUpdateWithoutModificationsInputSchema } from './BookingUncheckedUpdateWithoutModificationsInputSchema';
import { BookingCreateWithoutModificationsInputSchema } from './BookingCreateWithoutModificationsInputSchema';
import { BookingUncheckedCreateWithoutModificationsInputSchema } from './BookingUncheckedCreateWithoutModificationsInputSchema';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';

export const BookingUpsertWithoutModificationsInputSchema: z.ZodType<Prisma.BookingUpsertWithoutModificationsInput> = z.strictObject({
  update: z.union([ z.lazy(() => BookingUpdateWithoutModificationsInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutModificationsInputSchema) ]),
  create: z.union([ z.lazy(() => BookingCreateWithoutModificationsInputSchema), z.lazy(() => BookingUncheckedCreateWithoutModificationsInputSchema) ]),
  where: z.lazy(() => BookingWhereInputSchema).optional(),
});

export default BookingUpsertWithoutModificationsInputSchema;
