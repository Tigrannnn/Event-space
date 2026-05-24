import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventImageCreateManyEventInputSchema: z.ZodType<Prisma.EventImageCreateManyEventInput> = z.object({
  id: z.uuid().optional(),
  url: z.string(),
  publicId: z.string(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).strict();

export default EventImageCreateManyEventInputSchema;
