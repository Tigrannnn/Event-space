import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventImageUncheckedCreateInputSchema: z.ZodType<Prisma.EventImageUncheckedCreateInput> = z.object({
  id: z.uuid().optional(),
  eventId: z.string(),
  url: z.string(),
  publicId: z.string(),
  order: z.number().int(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).strict();

export default EventImageUncheckedCreateInputSchema;
