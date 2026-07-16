import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventTranslationUpdatewhatsIncludedInputSchema: z.ZodType<Prisma.EventTranslationUpdatewhatsIncludedInput> = z.strictObject({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
});

export default EventTranslationUpdatewhatsIncludedInputSchema;
