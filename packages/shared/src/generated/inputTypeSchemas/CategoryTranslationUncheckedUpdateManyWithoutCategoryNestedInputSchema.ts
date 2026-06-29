import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryTranslationCreateWithoutCategoryInputSchema } from './CategoryTranslationCreateWithoutCategoryInputSchema';
import { CategoryTranslationUncheckedCreateWithoutCategoryInputSchema } from './CategoryTranslationUncheckedCreateWithoutCategoryInputSchema';
import { CategoryTranslationCreateOrConnectWithoutCategoryInputSchema } from './CategoryTranslationCreateOrConnectWithoutCategoryInputSchema';
import { CategoryTranslationUpsertWithWhereUniqueWithoutCategoryInputSchema } from './CategoryTranslationUpsertWithWhereUniqueWithoutCategoryInputSchema';
import { CategoryTranslationCreateManyCategoryInputEnvelopeSchema } from './CategoryTranslationCreateManyCategoryInputEnvelopeSchema';
import { CategoryTranslationWhereUniqueInputSchema } from './CategoryTranslationWhereUniqueInputSchema';
import { CategoryTranslationUpdateWithWhereUniqueWithoutCategoryInputSchema } from './CategoryTranslationUpdateWithWhereUniqueWithoutCategoryInputSchema';
import { CategoryTranslationUpdateManyWithWhereWithoutCategoryInputSchema } from './CategoryTranslationUpdateManyWithWhereWithoutCategoryInputSchema';
import { CategoryTranslationScalarWhereInputSchema } from './CategoryTranslationScalarWhereInputSchema';

export const CategoryTranslationUncheckedUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.CategoryTranslationUncheckedUpdateManyWithoutCategoryNestedInput> = z.object({
  create: z.union([ z.lazy(() => CategoryTranslationCreateWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationCreateWithoutCategoryInputSchema).array(), z.lazy(() => CategoryTranslationUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CategoryTranslationCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CategoryTranslationUpsertWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationUpsertWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CategoryTranslationCreateManyCategoryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CategoryTranslationWhereUniqueInputSchema), z.lazy(() => CategoryTranslationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CategoryTranslationWhereUniqueInputSchema), z.lazy(() => CategoryTranslationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CategoryTranslationWhereUniqueInputSchema), z.lazy(() => CategoryTranslationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CategoryTranslationWhereUniqueInputSchema), z.lazy(() => CategoryTranslationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CategoryTranslationUpdateWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationUpdateWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CategoryTranslationUpdateManyWithWhereWithoutCategoryInputSchema), z.lazy(() => CategoryTranslationUpdateManyWithWhereWithoutCategoryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CategoryTranslationScalarWhereInputSchema), z.lazy(() => CategoryTranslationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CategoryTranslationUncheckedUpdateManyWithoutCategoryNestedInputSchema;
