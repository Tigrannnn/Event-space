import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationUpdateManyMutationInputSchema } from '../inputTypeSchemas/EventTranslationUpdateManyMutationInputSchema'
import { EventTranslationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/EventTranslationUncheckedUpdateManyInputSchema'
import { EventTranslationWhereInputSchema } from '../inputTypeSchemas/EventTranslationWhereInputSchema'

export const EventTranslationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.EventTranslationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ EventTranslationUpdateManyMutationInputSchema, EventTranslationUncheckedUpdateManyInputSchema ]),
  where: EventTranslationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default EventTranslationUpdateManyAndReturnArgsSchema;
