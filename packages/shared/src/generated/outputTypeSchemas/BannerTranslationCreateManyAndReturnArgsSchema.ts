import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationCreateManyInputSchema } from '../inputTypeSchemas/BannerTranslationCreateManyInputSchema'

export const BannerTranslationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.BannerTranslationCreateManyAndReturnArgs> = z.object({
  data: z.union([ BannerTranslationCreateManyInputSchema, BannerTranslationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default BannerTranslationCreateManyAndReturnArgsSchema;
