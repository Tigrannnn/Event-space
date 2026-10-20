import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { BookingCreateWithoutModificationsInputSchema } from './BookingCreateWithoutModificationsInputSchema';
import { BookingUncheckedCreateWithoutModificationsInputSchema } from './BookingUncheckedCreateWithoutModificationsInputSchema';
import { BookingCreateOrConnectWithoutModificationsInputSchema } from './BookingCreateOrConnectWithoutModificationsInputSchema';
import { BookingUpsertWithoutModificationsInputSchema } from './BookingUpsertWithoutModificationsInputSchema';
import { BookingWhereUniqueInputSchema } from './BookingWhereUniqueInputSchema';
import { BookingUpdateToOneWithWhereWithoutModificationsInputSchema } from './BookingUpdateToOneWithWhereWithoutModificationsInputSchema';
import { BookingUpdateWithoutModificationsInputSchema } from './BookingUpdateWithoutModificationsInputSchema';
import { BookingUncheckedUpdateWithoutModificationsInputSchema } from './BookingUncheckedUpdateWithoutModificationsInputSchema';

export const BookingUpdateOneRequiredWithoutModificationsNestedInputSchema: z.ZodType<Prisma.BookingUpdateOneRequiredWithoutModificationsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => BookingCreateWithoutModificationsInputSchema), z.lazy(() => BookingUncheckedCreateWithoutModificationsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BookingCreateOrConnectWithoutModificationsInputSchema).optional(),
  upsert: z.lazy(() => BookingUpsertWithoutModificationsInputSchema).optional(),
  connect: z.lazy(() => BookingWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BookingUpdateToOneWithWhereWithoutModificationsInputSchema), z.lazy(() => BookingUpdateWithoutModificationsInputSchema), z.lazy(() => BookingUncheckedUpdateWithoutModificationsInputSchema) ]).optional(),
});

export default BookingUpdateOneRequiredWithoutModificationsNestedInputSchema;
