import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { BannerSelectSchema } from '../inputTypeSchemas/BannerSelectSchema';
import { BannerIncludeSchema } from '../inputTypeSchemas/BannerIncludeSchema';

export const BannerArgsSchema: z.ZodType<Prisma.BannerDefaultArgs> = z.object({
  select: z.lazy(() => BannerSelectSchema).optional(),
  include: z.lazy(() => BannerIncludeSchema).optional(),
}).strict();

export default BannerArgsSchema;
