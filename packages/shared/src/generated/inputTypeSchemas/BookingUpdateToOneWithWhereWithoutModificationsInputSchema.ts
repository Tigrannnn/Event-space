import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';
import { BookingUpdateWithoutModificationsInputSchema } from './BookingUpdateWithoutModificationsInputSchema';
import { BookingUncheckedUpdateWithoutModificationsInputSchema } from './BookingUncheckedUpdateWithoutModificationsInputSchema';

export const BookingUpdateToOneWithWhereWithoutModificationsInputSchema: z.ZodType<Prisma.BookingUpdateToOneWithWhereWithoutModificationsInput> = z.strictObject({
  where: z.lazy(() => BookingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => BookingUpdateWithoutModificationsInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutModificationsInputSchema) ]),
});

export default BookingUpdateToOneWithWhereWithoutModificationsInputSchema;
