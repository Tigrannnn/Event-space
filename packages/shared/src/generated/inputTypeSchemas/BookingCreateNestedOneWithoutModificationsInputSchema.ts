import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutModificationsInputSchema } from './BookingCreateWithoutModificationsInputSchema';
import { BookingUncheckedCreateWithoutModificationsInputSchema } from './BookingUncheckedCreateWithoutModificationsInputSchema';
import { BookingCreateOrConnectWithoutModificationsInputSchema } from './BookingCreateOrConnectWithoutModificationsInputSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';

export const BookingCreateNestedOneWithoutModificationsInputSchema: z.ZodType<Prisma.BookingCreateNestedOneWithoutModificationsInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingCreateWithoutModificationsInputSchema), z.lazy(() => BookingUncheckedCreateWithoutModificationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutModificationsInputSchema).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional(),
});

export default BookingCreateNestedOneWithoutModificationsInputSchema;
