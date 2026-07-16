import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationCreateManyCategoryInputSchema } from './CategoryTranslationCreateManyCategoryInputSchema';

export const CategoryTranslationCreateManyCategoryInputEnvelopeSchema: z.ZodType<Prisma.CategoryTranslationCreateManyCategoryInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => CategoryTranslationCreateManyCategoryInputSchema), z.lazy(() => CategoryTranslationCreateManyCategoryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export default CategoryTranslationCreateManyCategoryInputEnvelopeSchema;
