import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { CategoryTranslationOrderByRelationAggregateInputSchema } from './CategoryTranslationOrderByRelationAggregateInputSchema';
import { EventOrderByRelationAggregateInputSchema } from './EventOrderByRelationAggregateInputSchema';

export const CategoryOrderByWithRelationInputSchema: z.ZodType<Prisma.CategoryOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  translations: z.lazy(() => CategoryTranslationOrderByRelationAggregateInputSchema).optional(),
  events: z.lazy(() => EventOrderByRelationAggregateInputSchema).optional(),
}).strict();

export default CategoryOrderByWithRelationInputSchema;
