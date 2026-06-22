import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationWhereInputSchema } from '../inputTypeSchemas/EventTranslationWhereInputSchema'

export const EventTranslationDeleteManyArgsSchema: z.ZodType<Prisma.EventTranslationDeleteManyArgs> = z.object({
  where: EventTranslationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default EventTranslationDeleteManyArgsSchema;
