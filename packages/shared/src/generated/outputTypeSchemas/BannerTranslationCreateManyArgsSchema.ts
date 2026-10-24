import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationCreateManyInputSchema } from '../inputTypeSchemas/BannerTranslationCreateManyInputSchema'

export const BannerTranslationCreateManyArgsSchema: z.ZodType<Prisma.BannerTranslationCreateManyArgs> = z.object({
  data: z.union([ BannerTranslationCreateManyInputSchema, BannerTranslationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BannerTranslationCreateManyArgsSchema;
