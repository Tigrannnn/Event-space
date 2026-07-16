import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const EventTranslationCreatewhatsIncludedInputSchema: z.ZodType<Prisma.EventTranslationCreatewhatsIncludedInput> = z.strictObject({
  set: z.string().array(),
});

export default EventTranslationCreatewhatsIncludedInputSchema;
