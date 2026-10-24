import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationUpdateManyMutationInputSchema } from '../inputTypeSchemas/BannerTranslationUpdateManyMutationInputSchema'
import { BannerTranslationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/BannerTranslationUncheckedUpdateManyInputSchema'
import { BannerTranslationWhereInputSchema } from '../inputTypeSchemas/BannerTranslationWhereInputSchema'

export const BannerTranslationUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.BannerTranslationUpdateManyAndReturnArgs> = z.object({
  data: z.union([ BannerTranslationUpdateManyMutationInputSchema, BannerTranslationUncheckedUpdateManyInputSchema ]),
  where: BannerTranslationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BannerTranslationUpdateManyAndReturnArgsSchema;
