import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { EventCreateNestedOneWithoutImagesInputSchema } from './EventCreateNestedOneWithoutImagesInputSchema';

export const EventImageCreateInputSchema: z.ZodType<Prisma.EventImageCreateInput> = z.object({
  id: z.uuid().optional(),
  url: z.string(),
  publicId: z.string(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  event: z.lazy(() => EventCreateNestedOneWithoutImagesInputSchema),
}).strict();

export default EventImageCreateInputSchema;
