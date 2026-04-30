import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutEventInputSchema } from './BookingCreateWithoutEventInputSchema';
import { BookingUncheckedCreateWithoutEventInputSchema } from './BookingUncheckedCreateWithoutEventInputSchema';
import { BookingCreateOrConnectWithoutEventInputSchema } from './BookingCreateOrConnectWithoutEventInputSchema';
import { BookingCreateManyEventInputEnvelopeSchema } from './BookingCreateManyEventInputEnvelopeSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';

export const BookingUncheckedCreateNestedManyWithoutEventInputSchema: z.ZodType<Prisma.BookingUncheckedCreateNestedManyWithoutEventInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutEventInputSchema), z.lazy(() => BookingCreateWithoutEventInputSchema).array(), z.lazy(() => BookingUncheckedCreateWithoutEventInputSchema), z.lazy(() => BookingUncheckedCreateWithoutEventInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => BookingCreateOrConnectWithoutEventInputSchema), z.lazy(() => BookingCreateOrConnectWithoutEventInputSchema).array() ]).optional(),
  createMany: z.lazy(() => BookingCreateManyEventInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => BookingWhereUniqueInputSchema), z.lazy(() => BookingWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default BookingUncheckedCreateNestedManyWithoutEventInputSchema;
