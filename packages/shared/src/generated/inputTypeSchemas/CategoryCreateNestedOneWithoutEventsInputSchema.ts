import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryCreateWithoutEventsInputSchema } from './CategoryCreateWithoutEventsInputSchema';
import { CategoryUncheckedCreateWithoutEventsInputSchema } from './CategoryUncheckedCreateWithoutEventsInputSchema';
import { CategoryCreateOrConnectWithoutEventsInputSchema } from './CategoryCreateOrConnectWithoutEventsInputSchema';
import { CategoryWhereUniqueInputSchema } from './CategoryWhereUniqueInputSchema';

export const CategoryCreateNestedOneWithoutEventsInputSchema: z.ZodType<Prisma.CategoryCreateNestedOneWithoutEventsInput> = z.object({
  create: z.union([ z.lazy(() => CategoryCreateWithoutEventsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutEventsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutEventsInputSchema).optional(),
  connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
}).strict();

export default CategoryCreateNestedOneWithoutEventsInputSchema;
