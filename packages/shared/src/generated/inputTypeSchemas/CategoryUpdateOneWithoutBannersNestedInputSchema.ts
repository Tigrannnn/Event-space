import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryCreateWithoutBannersInputSchema } from './CategoryCreateWithoutBannersInputSchema';
import { CategoryUncheckedCreateWithoutBannersInputSchema } from './CategoryUncheckedCreateWithoutBannersInputSchema';
import { CategoryCreateOrConnectWithoutBannersInputSchema } from './CategoryCreateOrConnectWithoutBannersInputSchema';
import { CategoryUpsertWithoutBannersInputSchema } from './CategoryUpsertWithoutBannersInputSchema';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';
import { CategoryWhereUniqueInputSchema } from './CategoryWhereUniqueInputSchema';
import { CategoryUpdateToOneWithWhereWithoutBannersInputSchema } from './CategoryUpdateToOneWithWhereWithoutBannersInputSchema';
import { CategoryUpdateWithoutBannersInputSchema } from './CategoryUpdateWithoutBannersInputSchema';
import { CategoryUncheckedUpdateWithoutBannersInputSchema } from './CategoryUncheckedUpdateWithoutBannersInputSchema';

export const CategoryUpdateOneWithoutBannersNestedInputSchema: z.ZodType<Prisma.CategoryUpdateOneWithoutBannersNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CategoryCreateWithoutBannersInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutBannersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutBannersInputSchema).optional(),
  upsert: z.lazy(() => CategoryUpsertWithoutBannersInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CategoryWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CategoryWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CategoryUpdateToOneWithWhereWithoutBannersInputSchema), z.lazy(() => CategoryUpdateWithoutBannersInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutBannersInputSchema) ]).optional(),
});

export default CategoryUpdateOneWithoutBannersNestedInputSchema;
