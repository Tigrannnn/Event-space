import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { EventArgsSchema } from "../outputTypeSchemas/EventArgsSchema"
import { CategoryArgsSchema } from "../outputTypeSchemas/CategoryArgsSchema"
import { BannerTranslationFindManyArgsSchema } from "../outputTypeSchemas/BannerTranslationFindManyArgsSchema"
import { BannerCountOutputTypeArgsSchema } from "../outputTypeSchemas/BannerCountOutputTypeArgsSchema"

export const BannerIncludeSchema: z.ZodType<Prisma.BannerInclude> = z.object({
  event: z.union([z.boolean(),z.lazy(() => EventArgsSchema)]).optional(),
  category: z.union([z.boolean(),z.lazy(() => CategoryArgsSchema)]).optional(),
  translations: z.union([z.boolean(),z.lazy(() => BannerTranslationFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => BannerCountOutputTypeArgsSchema)]).optional(),
}).strict();

export default BannerIncludeSchema;
