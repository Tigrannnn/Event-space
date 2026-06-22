import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationCreateManyInputSchema } from '../inputTypeSchemas/EventTranslationCreateManyInputSchema'

export const EventTranslationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.EventTranslationCreateManyAndReturnArgs> = z.object({
  data: z.union([ EventTranslationCreateManyInputSchema, EventTranslationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default EventTranslationCreateManyAndReturnArgsSchema;
