import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventImageCreateWithoutEventInputSchema: z.ZodType<Prisma.EventImageCreateWithoutEventInput> = z.strictObject({
  id: z.uuid().optional(),
  url: z.string(),
  publicId: z.string(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export default EventImageCreateWithoutEventInputSchema;
