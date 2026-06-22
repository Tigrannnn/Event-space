import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventTranslationCreatewhatsIncludedInputSchema: z.ZodType<Prisma.EventTranslationCreatewhatsIncludedInput> = z.object({
  set: z.string().array(),
}).strict();

export default EventTranslationCreatewhatsIncludedInputSchema;
