import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventImageScalarWhereInputSchema } from './EventImageScalarWhereInputSchema';
import { EventImageUpdateManyMutationInputSchema } from './EventImageUpdateManyMutationInputSchema';
import { EventImageUncheckedUpdateManyWithoutEventInputSchema } from './EventImageUncheckedUpdateManyWithoutEventInputSchema';

export const EventImageUpdateManyWithWhereWithoutEventInputSchema: z.ZodType<Prisma.EventImageUpdateManyWithWhereWithoutEventInput> = z.strictObject({
  where: z.lazy(() => EventImageScalarWhereInputSchema),
  data: z.union([ z.lazy(() => EventImageUpdateManyMutationInputSchema), z.lazy(() => EventImageUncheckedUpdateManyWithoutEventInputSchema) ]),
});

export default EventImageUpdateManyWithWhereWithoutEventInputSchema;
