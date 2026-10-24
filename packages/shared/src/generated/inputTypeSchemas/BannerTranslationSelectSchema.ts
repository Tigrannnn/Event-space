import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerArgsSchema } from "../outputTypeSchemas/BannerArgsSchema"

export const BannerTranslationSelectSchema: z.ZodType<Prisma.BannerTranslationSelect> = z.object({
  id: z.boolean().optional(),
  bannerId: z.boolean().optional(),
  locale: z.boolean().optional(),
  title: z.boolean().optional(),
  subtitle: z.boolean().optional(),
  banner: z.union([z.boolean(),z.lazy(() => BannerArgsSchema)]).optional(),
}).strict()

export default BannerTranslationSelectSchema;
