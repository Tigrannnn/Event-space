import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryCreateWithoutEventsInputSchema } from './CategoryCreateWithoutEventsInputSchema';
import { CategoryUncheckedCreateWithoutEventsInputSchema } from './CategoryUncheckedCreateWithoutEventsInputSchema';
import { CategoryCreateOrConnectWithoutEventsInputSchema } from './CategoryCreateOrConnectWithoutEventsInputSchema';
import { CategoryUpsertWithoutEventsInputSchema } from './CategoryUpsertWithoutEventsInputSchema';
import { CategoryWhereUniqueInputSchema } from './CategoryWhereUniqueInputSchema';
import { CategoryUpdateToOneWithWhereWithoutEventsInputSchema } from './CategoryUpdateToOneWithWhereWithoutEventsInputSchema';
import { CategoryUpdateWithoutEventsInputSchema } from './CategoryUpdateWithoutEventsInputSchema';
import { CategoryUncheckedUpdateWithoutEventsInputSchema } from './CategoryUncheckedUpdateWithoutEventsInputSchema';

export const CategoryUpdateOneRequiredWithoutEventsNestedInputSchema: z.ZodType<Prisma.CategoryUpdateOneRequiredWithoutEventsNestedInput> = z.object({
  create: z.union([ z.lazy(() => CategoryCreateWithoutEventsInputSchema), z.lazy(() => CategoryUncheckedCreateWithoutEventsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutEventsInputSchema).optional(),
  upsert: z.lazy(() => CategoryUpsertWithoutEventsInputSchema).optional(),
  connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CategoryUpdateToOneWithWhereWithoutEventsInputSchema), z.lazy(() => CategoryUpdateWithoutEventsInputSchema), z.lazy(() => CategoryUncheckedUpdateWithoutEventsInputSchema) ]).optional(),
}).strict();

export default CategoryUpdateOneRequiredWithoutEventsNestedInputSchema;
