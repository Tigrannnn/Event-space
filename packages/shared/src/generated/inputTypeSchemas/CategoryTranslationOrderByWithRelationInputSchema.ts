import type { Prisma } from '@prisma/client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { CategoryOrderByWithRelationInputSchema } from './CategoryOrderByWithRelationInputSchema';

export const CategoryTranslationOrderByWithRelationInputSchema: z.ZodType<Prisma.CategoryTranslationOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  categoryId: z.lazy(() => SortOrderSchema).optional(),
  locale: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => CategoryOrderByWithRelationInputSchema).optional(),
}).strict();

export default CategoryTranslationOrderByWithRelationInputSchema;
