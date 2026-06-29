import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { CategoryIncludeSchema } from '../inputTypeSchemas/CategoryIncludeSchema'
import { CategoryUpdateInputSchema } from '../inputTypeSchemas/CategoryUpdateInputSchema'
import { CategoryUncheckedUpdateInputSchema } from '../inputTypeSchemas/CategoryUncheckedUpdateInputSchema'
import { CategoryWhereUniqueInputSchema } from '../inputTypeSchemas/CategoryWhereUniqueInputSchema'
import { CategoryTranslationFindManyArgsSchema } from "../outputTypeSchemas/CategoryTranslationFindManyArgsSchema"
import { EventFindManyArgsSchema } from "../outputTypeSchemas/EventFindManyArgsSchema"
import { CategoryCountOutputTypeArgsSchema } from "../outputTypeSchemas/CategoryCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const CategorySelectSchema: z.ZodType<Prisma.CategorySelect> = z.object({
  id: z.boolean().optional(),
  slug: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  translations: z.union([z.boolean(),z.lazy(() => CategoryTranslationFindManyArgsSchema)]).optional(),
  events: z.union([z.boolean(),z.lazy(() => EventFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CategoryCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const CategoryUpdateArgsSchema: z.ZodType<Prisma.CategoryUpdateArgs> = z.object({
  select: CategorySelectSchema.optional(),
  include: z.lazy(() => CategoryIncludeSchema).optional(),
  data: z.union([ CategoryUpdateInputSchema, CategoryUncheckedUpdateInputSchema ]),
  where: CategoryWhereUniqueInputSchema, 
}).strict();

export default CategoryUpdateArgsSchema;
