import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryTranslationFindManyArgsSchema } from "../outputTypeSchemas/CategoryTranslationFindManyArgsSchema"
import { EventFindManyArgsSchema } from "../outputTypeSchemas/EventFindManyArgsSchema"
import { CategoryCountOutputTypeArgsSchema } from "../outputTypeSchemas/CategoryCountOutputTypeArgsSchema"

export const CategoryIncludeSchema: z.ZodType<Prisma.CategoryInclude> = z.object({
  translations: z.union([z.boolean(),z.lazy(() => CategoryTranslationFindManyArgsSchema)]).optional(),
  events: z.union([z.boolean(),z.lazy(() => EventFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CategoryCountOutputTypeArgsSchema)]).optional(),
}).strict();

export default CategoryIncludeSchema;
