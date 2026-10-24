import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationWhereInputSchema } from '../inputTypeSchemas/BannerTranslationWhereInputSchema'

export const BannerTranslationDeleteManyArgsSchema: z.ZodType<Prisma.BannerTranslationDeleteManyArgs> = z.object({
  where: BannerTranslationWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export default BannerTranslationDeleteManyArgsSchema;
