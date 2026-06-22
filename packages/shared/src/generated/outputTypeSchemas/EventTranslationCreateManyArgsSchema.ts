import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationCreateManyInputSchema } from '../inputTypeSchemas/EventTranslationCreateManyInputSchema'

export const EventTranslationCreateManyArgsSchema: z.ZodType<Prisma.EventTranslationCreateManyArgs> = z.object({
  data: z.union([ EventTranslationCreateManyInputSchema, EventTranslationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventTranslationCreateManyArgsSchema;
