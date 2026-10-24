import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerTranslationSelectSchema } from '../inputTypeSchemas/BannerTranslationSelectSchema';
import { BannerTranslationIncludeSchema } from '../inputTypeSchemas/BannerTranslationIncludeSchema';

export const BannerTranslationArgsSchema: z.ZodType<Prisma.BannerTranslationDefaultArgs> = z.object({
  select: z.lazy(() => BannerTranslationSelectSchema).optional(),
  include: z.lazy(() => BannerTranslationIncludeSchema).optional(),
}).strict();

export default BannerTranslationArgsSchema;
