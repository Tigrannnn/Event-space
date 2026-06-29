import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationFindManyArgsSchema } from "../outputTypeSchemas/CategoryTranslationFindManyArgsSchema"
import { EventFindManyArgsSchema } from "../outputTypeSchemas/EventFindManyArgsSchema"
import { CategoryCountOutputTypeArgsSchema } from "../outputTypeSchemas/CategoryCountOutputTypeArgsSchema"

export const CategorySelectSchema: z.ZodType<Prisma.CategorySelect> = z.object({
  id: z.boolean().optional(),
  slug: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  translations: z.union([z.boolean(),z.lazy(() => CategoryTranslationFindManyArgsSchema)]).optional(),
  events: z.union([z.boolean(),z.lazy(() => EventFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CategoryCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default CategorySelectSchema;
