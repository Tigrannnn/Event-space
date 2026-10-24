import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereUniqueInputSchema } from './CategoryWhereUniqueInputSchema';
import { CategoryCreateWithoutBannersInputSchema } from './CategoryCreateWithoutBannersInputSchema';
import { CategoryUncheckedCreateWithoutBannersInputSchema } from './CategoryUncheckedCreateWithoutBannersInputSchema';

export const CategoryCreateOrConnectWithoutBannersInputSchema: z.ZodType<Prisma.CategoryCreateOrConnectWithoutBannersInput> = z.strictObject({
  where: z.lazy(() => CategoryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CategoryCreateWithoutBannersInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutBannersInputSchema) ]),
});

export default CategoryCreateOrConnectWithoutBannersInputSchema;
