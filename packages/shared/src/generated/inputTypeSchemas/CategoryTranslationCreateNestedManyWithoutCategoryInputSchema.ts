import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationCreateWithoutCategoryInputSchema } from './CategoryTranslationCreateWithoutCategoryInputSchema';
import { CategoryTranslationUncheckedCreateWithoutCategoryInputSchema } from './CategoryTranslationUncheckedCreateWithoutCategoryInputSchema';
import { CategoryTranslationCreateOrConnectWithoutCategoryInputSchema } from './CategoryTranslationCreateOrConnectWithoutCategoryInputSchema';
import { CategoryTranslationCreateManyCategoryInputEnvelopeSchema } from './CategoryTranslationCreateManyCategoryInputEnvelopeSchema';
import { CategoryTranslationWhereUniqueInputSchema } from './CategoryTranslationWhereUniqueInputSchema';

export const CategoryTranslationCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.CategoryTranslationCreateNestedManyWithoutCategoryInput> = z.object({
  create: z.union([ z.lazy(() => CategoryTranslationCreateWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationCreateWithoutCategoryInputSchema).array(), z.lazy(() => CategoryTranslationUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CategoryTranslationCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CategoryTranslationCreateManyCategoryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CategoryTranslationWhereUniqueInputSchema), z.lazy(() => CategoryTranslationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CategoryTranslationCreateNestedManyWithoutCategoryInputSchema;
