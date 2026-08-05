import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingWhereInputSchema } from './BookingWhereInputSchema';
import { BookingUpdateWithoutStatusHistoryInputSchema } from './BookingUpdateWithoutStatusHistoryInputSchema';
import { BookingUncheckedUpdateWithoutStatusHistoryInputSchema } from './BookingUncheckedUpdateWithoutStatusHistoryInputSchema';

export const BookingUpdateToOneWithWhereWithoutStatusHistoryInputSchema: z.ZodType<Prisma.BookingUpdateToOneWithWhereWithoutStatusHistoryInput> = z.strictObject({
  where: z.lazy(() => BookingWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => BookingUpdateWithoutStatusHistoryInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutStatusHistoryInputSchema) ]),
});

export default BookingUpdateToOneWithWhereWithoutStatusHistoryInputSchema;
