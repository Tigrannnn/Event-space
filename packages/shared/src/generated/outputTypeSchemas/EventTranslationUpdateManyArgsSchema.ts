import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationUpdateManyMutationInputSchema } from '../inputTypeSchemas/EventTranslationUpdateManyMutationInputSchema'
import { EventTranslationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/EventTranslationUncheckedUpdateManyInputSchema'
import { EventTranslationWhereInputSchema } from '../inputTypeSchemas/EventTranslationWhereInputSchema'

export const EventTranslationUpdateManyArgsSchema: z.ZodType<Prisma.EventTranslationUpdateManyArgs> = z.object({
  data: z.union([ EventTranslationUpdateManyMutationInputSchema, EventTranslationUncheckedUpdateManyInputSchema ]),
  where: EventTranslationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default EventTranslationUpdateManyArgsSchema;
