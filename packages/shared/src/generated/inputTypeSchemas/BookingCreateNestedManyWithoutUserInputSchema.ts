import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutUserInputSchema } from './BookingCreateWithoutUserInputSchema';
import { BookingUncheckedCreateWithoutUserInputSchema } from './BookingUncheckedCreateWithoutUserInputSchema';
import { BookingCreateOrConnectWithoutUserInputSchema } from './BookingCreateOrConnectWithoutUserInputSchema';
import { BookingCreateManyUserInputEnvelopeSchema } from './BookingCreateManyUserInputEnvelopeSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';

export const BookingCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.BookingCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingCreateWithoutUserInputSchema), z.lazy(() => BookingCreateWithoutUserInputSchema).array(), z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema), z.lazy(() => BookingUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema), z.lazy(() => BookingCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
});

export default BookingCreateNestedManyWithoutUserInputSchema;
