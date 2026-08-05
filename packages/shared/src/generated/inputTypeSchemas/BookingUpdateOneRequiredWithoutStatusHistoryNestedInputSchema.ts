import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutStatusHistoryInputSchema } from './BookingCreateWithoutStatusHistoryInputSchema';
import { BookingUncheckedCreateWithoutStatusHistoryInputSchema } from './BookingUncheckedCreateWithoutStatusHistoryInputSchema';
import { BookingCreateOrConnectWithoutStatusHistoryInputSchema } from './BookingCreateOrConnectWithoutStatusHistoryInputSchema';
import { BookingUpsertWithoutStatusHistoryInputSchema } from './BookingUpsertWithoutStatusHistoryInputSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateToOneWithWhereWithoutStatusHistoryInputSchema } from './BookingUpdateToOneWithWhereWithoutStatusHistoryInputSchema';
import { BookingUpdateWithoutStatusHistoryInputSchema } from './BookingUpdateWithoutStatusHistoryInputSchema';
import { BookingUncheckedUpdateWithoutStatusHistoryInputSchema } from './BookingUncheckedUpdateWithoutStatusHistoryInputSchema';

export const BookingUpdateOneRequiredWithoutStatusHistoryNestedInputSchema: z.ZodType<Prisma.BookingUpdateOneRequiredWithoutStatusHistoryNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingCreateWithoutStatusHistoryInputSchema), z.lazy(() => BookingUncheckedCreateWithoutStatusHistoryInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutStatusHistoryInputSchema).optional(),
  upsert: z.lazy(() => BookingUpsertWithoutStatusHistoryInputSchema).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BookingUpdateToOneWithWhereWithoutStatusHistoryInputSchema), z.lazy(() => BookingUpdateWithoutStatusHistoryInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutStatusHistoryInputSchema) ]).optional(),
});

export default BookingUpdateOneRequiredWithoutStatusHistoryNestedInputSchema;
