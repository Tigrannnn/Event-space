import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationWhereInputSchema } from '../inputTypeSchemas/EventTranslationWhereInputSchema'
import { EventTranslationOrderByWithRelationInputSchema } from '../inputTypeSchemas/EventTranslationOrderByWithRelationInputSchema'
import { EventTranslationWhereUniqueInputSchema } from '../inputTypeSchemas/EventTranslationWhereUniqueInputSchema'

export const EventTranslationAggregateArgsSchema: z.ZodType<Prisma.EventTranslationAggregateArgs> = z.object({
  where: EventTranslationWhereInputSchema.optional(), 
  orderBy: z.union([ EventTranslationOrderByWithRelationInputSchema.array(), EventTranslationOrderByWithRelationInputSchema ]).optional(),
  cursor: EventTranslationWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default EventTranslationAggregateArgsSchema;
