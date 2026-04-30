import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingScalarWhereInputSchema } from './BookingScalarWhereInputSchema';
import { BookingUpdateManyMutationInputSchema } from './BookingUpdateManyMutationInputSchema';
import { BookingUncheckedUpdateManyWithoutEventInputSchema } from './BookingUncheckedUpdateManyWithoutEventInputSchema';

export const BookingUpdateManyWithWhereWithoutEventInputSchema: z.ZodType<Prisma.BookingUpdateManyWithWhereWithoutEventInput> = z.object({
  where: z.lazy(() => BookingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateManyMutationInputSchema), z.lazy(() => BookingUncheckedUpdateManyWithoutEventInputSchema) ]),
}).strict();

export default BookingUpdateManyWithWhereWithoutEventInputSchema;
