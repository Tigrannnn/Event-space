import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationCreateManyInputSchema } from '../inputTypeSchemas/CategoryTranslationCreateManyInputSchema'

export const CategoryTranslationCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CategoryTranslationCreateManyAndReturnArgs> = z.object({
  data: z.union([ CategoryTranslationCreateManyInputSchema, CategoryTranslationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export default CategoryTranslationCreateManyAndReturnArgsSchema;
