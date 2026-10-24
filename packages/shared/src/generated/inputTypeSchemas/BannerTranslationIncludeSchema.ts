import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerArgsSchema } from "../outputTypeSchemas/BannerArgsSchema"

export const BannerTranslationIncludeSchema: z.ZodType<Prisma.BannerTranslationInclude> = z.object({
  banner: z.union([z.boolean(),z.lazy(() => BannerArgsSchema)]).optional(),
}).strict();

export default BannerTranslationIncludeSchema;
