import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingScalarWhereInputSchema } from './BookingScalarWhereInputSchema';
import { BookingUpdateManyMutationInputSchema } from './BookingUpdateManyMutationInputSchema';
import { BookingUncheckedUpdateManyWithoutUserInputSchema } from './BookingUncheckedUpdateManyWithoutUserInputSchema';

export const BookingUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.BookingUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => BookingScalarWhereInputSchema),
  data: z.union([ z.lazy(() => BookingUpdateManyMutationInputSchema), z.lazy(() => BookingUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export default BookingUpdateManyWithWhereWithoutUserInputSchema;
