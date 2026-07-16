import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageWhereUniqueInputSchema } from './EventImageWhereUniqueInputSchema';
import { EventImageUpdateWithoutEventInputSchema } from './EventImageUpdateWithoutEventInputSchema';
import { EventImageUncheckedUpdateWithoutEventInputSchema } from './EventImageUncheckedUpdateWithoutEventInputSchema';
import { EventImageCreateWithoutEventInputSchema } from './EventImageCreateWithoutEventInputSchema';
import { EventImageUncheckedCreateWithoutEventInputSchema } from './EventImageUncheckedCreateWithoutEventInputSchema';

export const EventImageUpsertWithWhereUniqueWithoutEventInputSchema: z.ZodType<Prisma.EventImageUpsertWithWhereUniqueWithoutEventInput> = z.strictObject({
  where: z.lazy(() => EventImageWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => EventImageUpdateWithoutEventInputSchema), z.lazy(() => EventImageUncheckedUpdateWithoutEventInputSchema) ]),
  create: z.union([ z.lazy(() => EventImageCreateWithoutEventInputSchema), z.lazy(() => EventImageUncheckedCreateWithoutEventInputSchema) ]),
});

export default EventImageUpsertWithWhereUniqueWithoutEventInputSchema;
