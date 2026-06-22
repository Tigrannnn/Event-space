import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventTranslationWhereInputSchema } from '../inputTypeSchemas/EventTranslationWhereInputSchema'
import { EventTranslationOrderByWithAggregationInputSchema } from '../inputTypeSchemas/EventTranslationOrderByWithAggregationInputSchema'
import { EventTranslationScalarFieldEnumSchema } from '../inputTypeSchemas/EventTranslationScalarFieldEnumSchema'
import { EventTranslationScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/EventTranslationScalarWhereWithAggregatesInputSchema'

export const EventTranslationGroupByArgsSchema: z.ZodType<Prisma.EventTranslationGroupByArgs> = z.object({
  where: EventTranslationWhereInputSchema.optional(), 
  orderBy: z.union([ EventTranslationOrderByWithAggregationInputSchema.array(), EventTranslationOrderByWithAggregationInputSchema ]).optional(),
  by: EventTranslationScalarFieldEnumSchema.array(), 
  having: EventTranslationScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export default EventTranslationGroupByArgsSchema;
