import type { Prisma } from '@prisma/client';

import { z } from 'zod';

export const CategoryCreateManyInputSchema: z.ZodType<Prisma.CategoryCreateManyInput> = z.object({
  id: z.uuid().optional(),
  slug: z.string(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).strict();

export default CategoryCreateManyInputSchema;
