import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutAdjustmentsInputSchema } from './BookingCreateWithoutAdjustmentsInputSchema';
import { BookingUncheckedCreateWithoutAdjustmentsInputSchema } from './BookingUncheckedCreateWithoutAdjustmentsInputSchema';
import { BookingCreateOrConnectWithoutAdjustmentsInputSchema } from './BookingCreateOrConnectWithoutAdjustmentsInputSchema';
import { BookingUpsertWithoutAdjustmentsInputSchema } from './BookingUpsertWithoutAdjustmentsInputSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateToOneWithWhereWithoutAdjustmentsInputSchema } from './BookingUpdateToOneWithWhereWithoutAdjustmentsInputSchema';
import { BookingUpdateWithoutAdjustmentsInputSchema } from './BookingUpdateWithoutAdjustmentsInputSchema';
import { BookingUncheckedUpdateWithoutAdjustmentsInputSchema } from './BookingUncheckedUpdateWithoutAdjustmentsInputSchema';

export const BookingUpdateOneRequiredWithoutAdjustmentsNestedInputSchema: z.ZodType<Prisma.BookingUpdateOneRequiredWithoutAdjustmentsNestedInput> = z.object({
  create: z.union([ z.lazy(() => BookingCreateWithoutAdjustmentsInputSchema), z.lazy(() => BookingUncheckedCreateWithoutAdjustmentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutAdjustmentsInputSchema).optional(),
  upsert: z.lazy(() => BookingUpsertWithoutAdjustmentsInputSchema).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BookingUpdateToOneWithWhereWithoutAdjustmentsInputSchema), z.lazy(() => BookingUpdateWithoutAdjustmentsInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutAdjustmentsInputSchema) ]).optional(),
}).strict();

export default BookingUpdateOneRequiredWithoutAdjustmentsNestedInputSchema;
