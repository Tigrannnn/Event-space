import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryCreateWithoutBannersInputSchema } from './CategoryCreateWithoutBannersInputSchema';
import { CategoryUncheckedCreateWithoutBannersInputSchema } from './CategoryUncheckedCreateWithoutBannersInputSchema';
import { CategoryCreateOrConnectWithoutBannersInputSchema } from './CategoryCreateOrConnectWithoutBannersInputSchema';
import { CategoryWhereUniqueInputSchema } from './CategoryWhereUniqueInputSchema';

export const CategoryCreateNestedOneWithoutBannersInputSchema: z.ZodType<Prisma.CategoryCreateNestedOneWithoutBannersInput> = z.strictObject({
  create: z.union([ z.lazy(() => CategoryCreateWithoutBannersInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutBannersInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutBannersInputSchema).optional(),
  connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
});

export default CategoryCreateNestedOneWithoutBannersInputSchema;
