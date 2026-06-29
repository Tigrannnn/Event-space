import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { CategoryWhereInputSchema } from './CategoryWhereInputSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { CategoryTranslationListRelationFilterSchema } from './CategoryTranslationListRelationFilterSchema';
import { EventListRelationFilterSchema } from './EventListRelationFilterSchema';

export const CategoryWhereUniqueInputSchema: z.ZodType<Prisma.CategoryWhereUniqueInput> = z.union([
  z.object({
    id: z.uuid(),
    slug: z.string(),
  }),
  z.object({
    id: z.uuid(),
  }),
  z.object({
    slug: z.string(),
  }),
])
.and(z.object({
  id: z.uuid().optional(),
  slug: z.string().optional(),
  AND: z.union([ z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoryWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  translations: z.lazy(() => CategoryTranslationListRelationFilterSchema).optional(),
  events: z.lazy(() => EventListRelationFilterSchema).optional(),
}).strict());

export default CategoryWhereUniqueInputSchema;
